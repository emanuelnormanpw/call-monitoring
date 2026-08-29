use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, sqlx::FromRow)]
pub struct CallLog {
    pub call_id: String,
    pub call_timestamp: DateTime<Utc>,
    pub cs_name: String,
    pub customer_name: String,
    pub sentiment_score: f64,
}

/// Query string of `GET /api/calls`. Every field is optional; `Default` keeps
/// tests readable when only one parameter is under test.
#[derive(Deserialize, Default)]
pub struct CallLogQuery {
    pub search: Option<String>,
    pub sentiment: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub sort_by: Option<String>,
    pub sort_dir: Option<String>,
    /// IANA zone the caller reads dates and timestamps in, e.g. `Asia/Jakarta`.
    pub tz: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub data: Vec<T>,
    pub total_data: i64,
    pub page: i64,
    pub limit: i64,
}

#[cfg(test)]
mod tests {
    use chrono::TimeZone;

    use super::*;

    #[test]
    fn api_response_serializes_the_keys_the_frontend_reads() {
        let response = ApiResponse {
            data: vec![1_i64, 2],
            total_data: 7,
            page: 2,
            limit: 5,
        };

        let json = serde_json::to_value(&response).expect("serializes");

        assert_eq!(json["data"], serde_json::json!([1, 2]));
        assert_eq!(json["total_data"], 7);
        assert_eq!(json["page"], 2);
        assert_eq!(json["limit"], 5);
    }

    #[test]
    fn call_log_serializes_every_column_the_table_displays() {
        let call = CallLog {
            call_id: "CALL-2026-001".to_string(),
            call_timestamp: Utc.with_ymd_and_hms(2026, 8, 28, 13, 30, 32).unwrap(),
            cs_name: "Andi Pratama".to_string(),
            customer_name: "Budi Santoso".to_string(),
            sentiment_score: 85.5,
        };

        let json = serde_json::to_value(&call).expect("serializes");

        assert_eq!(json["call_id"], "CALL-2026-001");
        assert_eq!(json["cs_name"], "Andi Pratama");
        assert_eq!(json["customer_name"], "Budi Santoso");
        assert_eq!(json["sentiment_score"], 85.5);
        assert_eq!(json["call_timestamp"], "2026-08-28T13:30:32Z");
    }

    #[test]
    fn query_deserializes_the_documented_parameter_names() {
        let query: CallLogQuery = serde_urlencoded::from_str(
            "search=Andi&sentiment=under_70&start_date=2026-08-01&end_date=2026-08-31\
             &sort_by=cs_name&sort_dir=asc&tz=Asia/Jakarta&page=2&limit=10",
        )
        .expect("deserializes");

        assert_eq!(query.search.as_deref(), Some("Andi"));
        assert_eq!(query.sentiment.as_deref(), Some("under_70"));
        assert_eq!(query.start_date.as_deref(), Some("2026-08-01"));
        assert_eq!(query.end_date.as_deref(), Some("2026-08-31"));
        assert_eq!(query.sort_by.as_deref(), Some("cs_name"));
        assert_eq!(query.sort_dir.as_deref(), Some("asc"));
        assert_eq!(query.tz.as_deref(), Some("Asia/Jakarta"));
        assert_eq!(query.page, Some(2));
        assert_eq!(query.limit, Some(10));
    }

    #[test]
    fn query_leaves_every_parameter_empty_when_none_are_sent() {
        let query: CallLogQuery = serde_urlencoded::from_str("").expect("deserializes");

        assert!(query.search.is_none());
        assert!(query.sentiment.is_none());
        assert!(query.start_date.is_none());
        assert!(query.end_date.is_none());
        assert!(query.sort_by.is_none());
        assert!(query.sort_dir.is_none());
        assert!(query.tz.is_none());
        assert!(query.page.is_none());
        assert!(query.limit.is_none());
    }
}
