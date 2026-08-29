pub mod handlers;
pub mod models;
pub mod query;

use axum::{
    http::{header, HeaderValue, Method},
    routing::get,
    Router,
};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

/// Origins allowed when `CORS_ORIGINS` is unset: the Vite dev server and the
/// port docker-compose publishes the built frontend on.
pub const DEFAULT_CORS_ORIGINS: &str = "http://localhost:3001,http://localhost:5173";

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    /// Zone applied when a request does not name one. Set with `APP_TIMEZONE`.
    pub default_timezone: String,
}

/// Parse a comma-separated origin list. Blank and unparseable entries are
/// dropped; an empty result falls back to the defaults so a typo in the env
/// var cannot silently lock every browser out.
pub fn parse_cors_origins(raw: &str) -> Vec<HeaderValue> {
    let origins: Vec<HeaderValue> = raw
        .split(',')
        .map(str::trim)
        .filter(|origin| !origin.is_empty())
        .filter_map(|origin| origin.parse::<HeaderValue>().ok())
        .collect();

    if origins.is_empty() {
        return parse_cors_origins(DEFAULT_CORS_ORIGINS);
    }

    origins
}

/// Build the application router. Kept separate from `main` so tests and future
/// tooling can mount the same routes without opening a listener.
pub fn app(pool: PgPool) -> Router {
    let allowed_origins =
        std::env::var("CORS_ORIGINS").unwrap_or_else(|_| DEFAULT_CORS_ORIGINS.to_string());

    // CORS Setup (Allow Client Fetching)
    let cors = CorsLayer::new()
        .allow_origin(parse_cors_origins(&allowed_origins))
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT])
        .allow_credentials(true);

    Router::new()
        .route("/api/calls", get(handlers::get_calls))
        .layer(cors)
        .with_state(AppState {
            db: pool,
            default_timezone: std::env::var("APP_TIMEZONE")
                .unwrap_or_else(|_| query::DEFAULT_TIMEZONE.to_string()),
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn origins(raw: &str) -> Vec<String> {
        parse_cors_origins(raw)
            .iter()
            .map(|value| value.to_str().unwrap().to_string())
            .collect()
    }

    #[test]
    fn the_default_covers_both_the_dev_server_and_the_composed_frontend() {
        assert_eq!(
            origins(DEFAULT_CORS_ORIGINS),
            ["http://localhost:3001", "http://localhost:5173"]
        );
    }

    #[test]
    fn a_configured_list_is_split_and_trimmed() {
        assert_eq!(
            origins(" http://a.test , http://b.test "),
            ["http://a.test", "http://b.test"]
        );
    }

    #[test]
    fn blank_entries_are_dropped() {
        assert_eq!(
            origins("http://a.test,,  ,http://b.test"),
            ["http://a.test", "http://b.test"]
        );
    }

    #[test]
    fn an_unusable_value_falls_back_instead_of_allowing_nothing() {
        // An empty or all-invalid list would otherwise block every browser.
        for raw in ["", "   ", ",,,", "hea\nder"] {
            assert_eq!(
                origins(raw),
                ["http://localhost:3001", "http://localhost:5173"],
                "input {raw:?}"
            );
        }
    }
}
