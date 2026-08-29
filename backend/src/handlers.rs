use axum::{
    extract::{Query, State},
    Json,
};
use sqlx::{Postgres, QueryBuilder};

use crate::models::{ApiResponse, CallLog, CallLogQuery};
use crate::query::{
    apply_filters, resolve_pagination, resolve_sort_column, resolve_sort_direction,
    resolve_timezone, COUNT_CALLS, SELECT_CALLS,
};
use crate::AppState;

pub async fn get_calls(
    State(state): State<AppState>,
    Query(params): Query<CallLogQuery>,
) -> Json<ApiResponse<CallLog>> {
    let pagination = resolve_pagination(params.page, params.limit);

    // One zone for the whole request: the period bounds and the timestamp the
    // search matches against must never be interpreted differently.
    let timezone = resolve_timezone(params.tz.as_deref(), &state.default_timezone);

    let sort_column = resolve_sort_column(params.sort_by.as_deref());
    let sort_direction = resolve_sort_direction(params.sort_dir.as_deref());

    let mut data_query: QueryBuilder<Postgres> = QueryBuilder::new(SELECT_CALLS);
    apply_filters(&mut data_query, &params, &timezone);

    // Sorting & Pagination. call_id breaks ties so paging stays stable when the
    // sorted column holds duplicate values.
    data_query.push(" ORDER BY ");
    data_query.push(sort_column);
    data_query.push(" ");
    data_query.push(sort_direction);
    data_query.push(", call_id ASC LIMIT ");
    data_query.push_bind(pagination.limit);
    data_query.push(" OFFSET ");
    data_query.push_bind(pagination.offset);

    let calls = data_query
        .build_query_as::<CallLog>()
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    // The total has to honour the same filters, otherwise the page count would
    // describe the whole table instead of the current result set.
    let mut count_query: QueryBuilder<Postgres> = QueryBuilder::new(COUNT_CALLS);
    apply_filters(&mut count_query, &params, &timezone);

    let total_data: (i64,) = count_query
        .build_query_as::<(i64,)>()
        .fetch_one(&state.db)
        .await
        .unwrap_or((0,));

    Json(ApiResponse {
        data: calls,
        total_data: total_data.0,
        page: pagination.page,
        limit: pagination.limit,
    })
}
