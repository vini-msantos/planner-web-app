use axum::{Json, Router, extract::{Path, State}, http::StatusCode, routing::{delete, patch, post}};

use crate::{AppState, dtos::{ColumnCreationPayload, ColumnPatchPayload, ColumnRoutingPayload}, models::ColumnId, services};

pub fn router() -> Router<crate::AppState> {
    Router::new()
        .route("/", post(post_column))
        .route("/{id}", delete(delete_column))
        .route("/{id}", patch(patch_column))
        .route("/{id}/edit-route", post(edit_column_routes_to))
}

async fn post_column(
    State(state): State<AppState>,
    Json(payload): Json<ColumnCreationPayload>
) -> Result<StatusCode, StatusCode> {
    services::column::create(&state.pool, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::CREATED)
}

async fn delete_column(
    State(state): State<AppState>,
    Path(id): Path<ColumnId>,
) -> Result<StatusCode, StatusCode> {
    services::column::delete(&state.pool, &id).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}

async fn patch_column(
    State(state): State<AppState>,
    Path(id): Path<ColumnId>,
    Json(payload): Json<ColumnPatchPayload>
) -> Result<StatusCode, StatusCode> {
    services::column::patch(&state.pool, &id, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}

async fn edit_column_routes_to(
    State(state): State<AppState>,
    Path(id): Path<ColumnId>,
    Json(payload): Json<ColumnRoutingPayload>
) -> Result<StatusCode, StatusCode> {
    services::column::set_routing(&state.pool, &id, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}
