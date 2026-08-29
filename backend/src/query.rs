use chrono::NaiveDate;
use sqlx::{Postgres, QueryBuilder};

use crate::models::CallLogQuery;

pub const SELECT_CALLS: &str = "SELECT call_id, call_timestamp, cs_name, customer_name, \
     sentiment_score::float8 FROM call_logs WHERE 1=1";
pub const COUNT_CALLS: &str = "SELECT COUNT(*) FROM call_logs WHERE 1=1";

pub const DEFAULT_PAGE: i64 = 1;
pub const DEFAULT_LIMIT: i64 = 5;
pub const MAX_LIMIT: i64 = 100;

/// Zone used to turn calendar dates into instants, and to render timestamps for
/// the search, when the request does not name one.
pub const DEFAULT_TIMEZONE: &str = "UTC";

const DATE_FORMAT: &str = "%Y-%m-%d";
const MAX_TIMEZONE_LEN: usize = 64;

/// The sentiment threshold, mirrored from the UI badge so a search for the
/// verdict text finds the same rows the table labels that way.
const SATISFIED_THRESHOLD: &str = "70.0";

#[derive(Debug, PartialEq, Eq)]
pub struct Pagination {
    pub page: i64,
    pub limit: i64,
    pub offset: i64,
}

/// Clamp the paging parameters into a range the database can serve. The offset
/// uses saturating arithmetic: `(page - 1) * limit` overflows i64 for a large
/// page, which panics in debug and wraps to a negative offset in release.
pub fn resolve_pagination(page: Option<i64>, limit: Option<i64>) -> Pagination {
    let page = page.unwrap_or(DEFAULT_PAGE).max(1);
    let limit = limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT);

    Pagination {
        page,
        limit,
        offset: page.saturating_sub(1).saturating_mul(limit),
    }
}

/// Parse a `YYYY-MM-DD` calendar date. It stays a date on purpose: turning it
/// into an instant is the database's job, once it knows the zone.
pub fn parse_date(value: &str) -> Option<NaiveDate> {
    NaiveDate::parse_from_str(value.trim(), DATE_FORMAT).ok()
}

/// Pick the zone for this request, falling back to the server default. The name
/// is always bound, never interpolated, so this only rejects values Postgres
/// would choke on rather than guarding against injection.
pub fn resolve_timezone(requested: Option<&str>, fallback: &str) -> String {
    let candidate = requested
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(fallback);

    let looks_like_a_zone = !candidate.is_empty()
        && candidate.len() <= MAX_TIMEZONE_LEN
        && candidate
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '/' | '_' | '-' | '+'));

    if looks_like_a_zone {
        candidate.to_string()
    } else {
        DEFAULT_TIMEZONE.to_string()
    }
}

/// Only these columns may reach the ORDER BY clause. Sorting cannot be bound as
/// a parameter, so an allowlist is what keeps it injection safe.
pub fn resolve_sort_column(sort_by: Option<&str>) -> &'static str {
    match sort_by {
        Some("call_id") => "call_id",
        Some("cs_name") => "cs_name",
        Some("customer_name") => "customer_name",
        Some("sentiment_score") => "sentiment_score",
        _ => "call_timestamp",
    }
}

pub fn resolve_sort_direction(sort_dir: Option<&str>) -> &'static str {
    match sort_dir {
        Some("asc") => "ASC",
        _ => "DESC",
    }
}

/// Push the WHERE clauses shared by the data query and the count query, so both
/// always see exactly the same filters.
///
/// `timezone` is the zone the caller reads dates and timestamps in. Both the
/// period bounds and the timestamp rendered for the search use it, so the two
/// can never drift apart, and neither depends on the database session's
/// `TimeZone` setting.
pub fn apply_filters(
    builder: &mut QueryBuilder<'_, Postgres>,
    params: &CallLogQuery,
    timezone: &str,
) {
    // Search across every column shown in the table.
    if let Some(search) = &params.search {
        let keyword = search.trim();

        if !keyword.is_empty() {
            let pattern = format!("%{}%", keyword);

            builder.push(" AND (call_id ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR cs_name ILIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR customer_name ILIKE ");
            builder.push_bind(pattern.clone());

            // Render the timestamp in the caller's zone, so the text on screen
            // is the text the search matches.
            builder.push(" OR to_char(call_timestamp AT TIME ZONE ");
            builder.push_bind(timezone.to_string());
            builder.push(", 'YYYY-MM-DD HH24:MI:SS') ILIKE ");
            builder.push_bind(pattern.clone());

            // The table prints the score to one decimal, not the stored scale.
            builder.push(" OR round(sentiment_score, 1)::text ILIKE ");
            builder.push_bind(pattern.clone());

            // ... next to a verdict label, which is displayed text too.
            builder.push(" OR (CASE WHEN sentiment_score >= ");
            builder.push(SATISFIED_THRESHOLD);
            builder.push(" THEN 'Satisfied' ELSE 'Needs Review' END) ILIKE ");
            builder.push_bind(pattern);

            builder.push(")");
        }
    }

    // Filter Sentiment Score
    match params.sentiment.as_deref() {
        Some("under_70") => {
            builder.push(" AND sentiment_score < 70.0");
        }
        Some("70_above") => {
            builder.push(" AND sentiment_score >= 70.0");
        }
        _ => {}
    }

    // Filter Period. The bounds are local midnights in `timezone`, resolved by
    // Postgres. An unparseable date is treated as absent.
    if let Some(start) = params.start_date.as_deref().and_then(parse_date) {
        builder.push(" AND call_timestamp >= (");
        builder.push_bind(start);
        builder.push("::date::timestamp AT TIME ZONE ");
        builder.push_bind(timezone.to_string());
        builder.push(")");
    }

    // Half-open on the upper end: everything before the next local midnight.
    // That covers the whole end day whatever the timestamp precision, which a
    // literal `<= 23:59:59.999999` does not.
    if let Some(end) = params.end_date.as_deref().and_then(parse_date) {
        builder.push(" AND call_timestamp < ((");
        builder.push_bind(end);
        builder.push("::date + 1)::timestamp AT TIME ZONE ");
        builder.push_bind(timezone.to_string());
        builder.push(")");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TZ: &str = "Asia/Jakarta";

    fn filtered_sql(params: &CallLogQuery) -> String {
        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new(COUNT_CALLS);
        apply_filters(&mut builder, params, TZ);
        builder.sql().to_string()
    }

    // ---------- date parsing ----------

    #[test]
    fn a_calendar_date_parses_to_that_date() {
        assert_eq!(
            parse_date("2026-08-28"),
            NaiveDate::from_ymd_opt(2026, 8, 28)
        );
    }

    #[test]
    fn surrounding_whitespace_is_ignored() {
        assert_eq!(parse_date("  2026-08-28 "), parse_date("2026-08-28"));
        assert_eq!(parse_date("\t2026-08-28\n"), parse_date("2026-08-28"));
    }

    #[test]
    fn malformed_dates_are_rejected() {
        for value in [
            "",
            "   ",
            "28-08-2026",
            "2026/08/28",
            "2026-13-01",
            "2026-02-30",
            "yesterday",
            "2026-08-28T10:00:00Z",
        ] {
            assert!(parse_date(value).is_none(), "accepted {value:?}");
        }
    }

    // ---------- timezone resolution ----------

    #[test]
    fn a_requested_zone_wins_over_the_server_default() {
        assert_eq!(
            resolve_timezone(Some("Asia/Jakarta"), "UTC"),
            "Asia/Jakarta"
        );
        assert_eq!(
            resolve_timezone(Some("  Europe/Berlin  "), "UTC"),
            "Europe/Berlin"
        );
    }

    #[test]
    fn the_server_default_applies_when_no_zone_is_requested() {
        assert_eq!(resolve_timezone(None, "Asia/Jakarta"), "Asia/Jakarta");
        assert_eq!(resolve_timezone(Some(""), "Asia/Jakarta"), "Asia/Jakarta");
        assert_eq!(
            resolve_timezone(Some("   "), "Asia/Jakarta"),
            "Asia/Jakarta"
        );
    }

    #[test]
    fn a_zone_name_postgres_could_not_read_falls_back_to_utc() {
        for value in [
            "Asia/Jakarta'; DROP TABLE call_logs;--",
            "Asia Jakarta",
            "zone\nname",
            "a".repeat(MAX_TIMEZONE_LEN + 1).as_str(),
        ] {
            assert_eq!(
                resolve_timezone(Some(value), "Asia/Jakarta"),
                DEFAULT_TIMEZONE,
                "accepted {value:?}"
            );
        }
    }

    // ---------- sorting allowlist ----------

    #[test]
    fn a_column_on_the_allowlist_is_used_verbatim() {
        // call_timestamp is deliberately excluded here: it is also the fallback,
        // so asserting it would pass whether or not the allowlist kept it.
        for column in ["call_id", "cs_name", "customer_name", "sentiment_score"] {
            assert_eq!(resolve_sort_column(Some(column)), column);
        }
    }

    #[test]
    fn anything_off_the_allowlist_falls_back_to_the_timestamp() {
        assert_eq!(resolve_sort_column(None), "call_timestamp");
        assert_eq!(resolve_sort_column(Some("")), "call_timestamp");
        assert_eq!(resolve_sort_column(Some("password")), "call_timestamp");
        // The allowlist is case sensitive on purpose: no near-miss gets through.
        assert_eq!(resolve_sort_column(Some("CALL_ID")), "call_timestamp");
    }

    #[test]
    fn sort_column_cannot_be_used_to_inject_sql() {
        for payload in [
            "call_id; DROP TABLE call_logs;--",
            "1; DELETE FROM call_logs",
            "call_id UNION SELECT * FROM call_logs",
            "call_id --",
        ] {
            assert_eq!(
                resolve_sort_column(Some(payload)),
                "call_timestamp",
                "payload leaked into ORDER BY: {payload:?}"
            );
        }
    }

    #[test]
    fn ascending_is_the_only_input_that_does_not_sort_descending() {
        assert_eq!(resolve_sort_direction(Some("asc")), "ASC");

        // Everything else, including the explicit "desc", resolves to DESC.
        for value in [
            None,
            Some("desc"),
            Some("ASC"),
            Some("; DROP TABLE"),
            Some(""),
        ] {
            assert_eq!(resolve_sort_direction(value), "DESC", "input {value:?}");
        }
    }

    // ---------- pagination ----------

    #[test]
    fn pagination_defaults_to_the_first_five_rows() {
        assert_eq!(
            resolve_pagination(None, None),
            Pagination {
                page: 1,
                limit: 5,
                offset: 0
            }
        );
    }

    #[test]
    fn offset_follows_the_page_and_limit() {
        assert_eq!(resolve_pagination(Some(3), Some(5)).offset, 10);
        assert_eq!(resolve_pagination(Some(2), Some(20)).offset, 20);
    }

    #[test]
    fn page_below_one_is_clamped() {
        for page in [Some(0), Some(-1), Some(i64::MIN)] {
            let pagination = resolve_pagination(page, None);

            assert_eq!(pagination.page, 1);
            assert_eq!(pagination.offset, 0);
        }
    }

    #[test]
    fn a_huge_page_saturates_instead_of_overflowing() {
        // `(page - 1) * limit` panics in debug and wraps to a negative offset in
        // release, which Postgres rejects. Neither may happen.
        for page in [i64::MAX, i64::MAX - 1, 1_000_000_000_000_000_000] {
            for limit in [Some(1), Some(5), Some(MAX_LIMIT)] {
                let pagination = resolve_pagination(Some(page), limit);

                assert!(
                    pagination.offset >= 0,
                    "negative offset for page={page} limit={limit:?}"
                );
            }
        }
    }

    #[test]
    fn limit_is_clamped_into_a_servable_range() {
        assert_eq!(resolve_pagination(None, Some(0)).limit, 1);
        assert_eq!(resolve_pagination(None, Some(-5)).limit, 1);
        assert_eq!(resolve_pagination(None, Some(5_000)).limit, MAX_LIMIT);
        assert_eq!(resolve_pagination(None, Some(25)).limit, 25);
    }

    // ---------- filter composition ----------

    #[test]
    fn no_parameters_leave_the_base_query_untouched() {
        assert_eq!(filtered_sql(&CallLogQuery::default()), COUNT_CALLS);
    }

    #[test]
    fn search_covers_every_displayed_column_through_bind_placeholders() {
        let sql = filtered_sql(&CallLogQuery {
            search: Some("Andi".to_string()),
            ..Default::default()
        });

        assert!(sql.contains("call_id ILIKE"));
        assert!(sql.contains("cs_name ILIKE"));
        assert!(sql.contains("customer_name ILIKE"));
        assert!(sql.contains("to_char(call_timestamp AT TIME ZONE"));
        assert!(sql.contains("round(sentiment_score, 1)::text ILIKE"));
        assert!(sql.contains("THEN 'Satisfied' ELSE 'Needs Review' END) ILIKE"));

        // The keyword itself never reaches the SQL text - that is what makes
        // the search injection safe.
        assert!(!sql.contains("Andi"));
    }

    #[test]
    fn the_searched_timestamp_is_rendered_in_the_requested_zone() {
        let sql = filtered_sql(&CallLogQuery {
            search: Some("20:30".to_string()),
            ..Default::default()
        });

        // Pinned to a bound zone, so the result cannot depend on the database
        // session's TimeZone setting.
        assert!(sql.contains("to_char(call_timestamp AT TIME ZONE $4"));
        assert!(!sql.contains(TZ));
    }

    #[test]
    fn a_blank_search_is_ignored() {
        for keyword in ["", "   ", "\t\n"] {
            let sql = filtered_sql(&CallLogQuery {
                search: Some(keyword.to_string()),
                ..Default::default()
            });

            assert_eq!(sql, COUNT_CALLS, "blank search {keyword:?} added a clause");
        }
    }

    #[test]
    fn sentiment_splits_the_result_at_seventy() {
        let under = filtered_sql(&CallLogQuery {
            sentiment: Some("under_70".to_string()),
            ..Default::default()
        });
        let above = filtered_sql(&CallLogQuery {
            sentiment: Some("70_above".to_string()),
            ..Default::default()
        });

        assert!(under.ends_with(" AND sentiment_score < 70.0"));
        assert!(above.ends_with(" AND sentiment_score >= 70.0"));
    }

    #[test]
    fn an_unknown_sentiment_filters_nothing() {
        for value in ["all", "", "positive"] {
            let sql = filtered_sql(&CallLogQuery {
                sentiment: Some(value.to_string()),
                ..Default::default()
            });

            assert_eq!(sql, COUNT_CALLS, "sentiment {value:?} added a clause");
        }
    }

    #[test]
    fn each_period_bound_is_applied_on_its_own_in_the_requested_zone() {
        let start_only = filtered_sql(&CallLogQuery {
            start_date: Some("2026-08-01".to_string()),
            ..Default::default()
        });
        let end_only = filtered_sql(&CallLogQuery {
            end_date: Some("2026-08-31".to_string()),
            ..Default::default()
        });

        assert!(
            start_only.ends_with(" AND call_timestamp >= ($1::date::timestamp AT TIME ZONE $2)")
        );
        assert!(!start_only.contains("call_timestamp <"));

        // Half-open upper bound: strictly before the next local midnight.
        assert!(
            end_only.ends_with(" AND call_timestamp < (($1::date + 1)::timestamp AT TIME ZONE $2)")
        );
        assert!(!end_only.contains("call_timestamp >="));
    }

    #[test]
    fn an_unparseable_period_bound_is_dropped() {
        let sql = filtered_sql(&CallLogQuery {
            start_date: Some("not-a-date".to_string()),
            end_date: Some("2026-31-31".to_string()),
            ..Default::default()
        });

        assert_eq!(sql, COUNT_CALLS);
    }

    #[test]
    fn all_filters_combine_with_sequential_placeholders() {
        let sql = filtered_sql(&CallLogQuery {
            search: Some("Andi".to_string()),
            sentiment: Some("under_70".to_string()),
            start_date: Some("2026-08-01".to_string()),
            end_date: Some("2026-08-31".to_string()),
            ..Default::default()
        });

        assert!(sql.contains("ILIKE $1"));
        assert!(sql.contains("sentiment_score < 70.0"));
        // Search takes $1..$7 (five patterns plus the zone, used twice around
        // the timestamp), so the period bounds continue from there.
        assert!(sql.contains("call_timestamp >= ($8::date::timestamp AT TIME ZONE $9)"));
        assert!(sql.contains("call_timestamp < (($10::date + 1)::timestamp AT TIME ZONE $11)"));
    }
}
