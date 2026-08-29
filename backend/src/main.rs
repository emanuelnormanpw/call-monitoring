use axum::{
    extract::{Query, State},
    http::{header, HeaderValue, Method},
    routing::get,
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    db: PgPool,
}

#[derive(Serialize, sqlx::FromRow)]
struct CallLog {
    call_id: String,
    call_timestamp: DateTime<Utc>,
    cs_name: String,
    customer_name: String,
    sentiment_score: f64,
}

#[derive(Deserialize)]
struct CallLogQuery {
    search: Option<String>,
    sentiment: Option<String>,
    page: Option<i64>,
    limit: Option<i64>,
}

#[derive(Serialize)]
struct ApiResponse<T> {
    data: Vec<T>,
    total_data: i64,
    page: i64,
    limit: i64,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/call_monitoring".to_string());

    // Connect to PostgreSQL
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed connect to PostgreSQL");

    // CORS Setup (Allow Client Fetching)
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3001".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
        ])
        .allow_credentials(true);

    let app = Router::new()
        .route("/api/calls", get(get_calls))
        .layer(cors)
        .with_state(AppState { db: pool });

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Server running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

async fn get_calls(
    State(state): State<AppState>,
    Query(params): Query<CallLogQuery>,
) -> Json<ApiResponse<CallLog>> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(5);
    let offset = (page - 1) * limit;

    let mut query_builder = sqlx::QueryBuilder::new(
        "SELECT call_id, call_timestamp, cs_name, customer_name, sentiment_score::float8 FROM call_logs WHERE 1=1"
    );

    // Filter Search Keyword
    if let Some(search) = &params.search {
        if !search.trim().is_empty() {
            query_builder.push(" AND (call_id ILIKE ");
            query_builder.push_bind(format!("%{}%", search));
            query_builder.push(" OR cs_name ILIKE ");
            query_builder.push_bind(format!("%{}%", search));
            query_builder.push(" OR customer_name ILIKE ");
            query_builder.push_bind(format!("%{}%", search));
            query_builder.push(")");
        }
    }

    // Filter Sentiment Score
    if let Some(sentiment) = &params.sentiment {
        match sentiment.as_str() {
            "under_70" => { query_builder.push(" AND sentiment_score < 70.0"); }
            "70_above" => { query_builder.push(" AND sentiment_score >= 70.0"); }
            _ => {}
        }
    }

    // Sorting & Pagination
    query_builder.push(" ORDER BY call_timestamp DESC LIMIT ");
    query_builder.push_bind(limit);
    query_builder.push(" OFFSET ");
    query_builder.push_bind(offset);

    let calls = query_builder
        .build_query_as::<CallLog>()
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    let total_data: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM call_logs")
        .fetch_one(&state.db)
        .await
        .unwrap_or((0,));

    Json(ApiResponse {
        data: calls,
        total_data: total_data.0,
        page,
        limit,
    })
}