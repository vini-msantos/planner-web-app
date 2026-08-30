use std::collections::HashMap;

use axum::{Json, Router, extract::{Path, State}, http::StatusCode, routing::{delete, get, patch, post}};

use crate::{AppState, dtos::{ColumnCreationPayload, ColumnDumpingPayload, ColumnPatchPayload}, models::{Column, ColumnId}, services};

pub fn router() -> Router<crate::AppState> {
    Router::new()
        .route("/", post(post_column))
        .route("/", get(get_columns))
        .route("/{id}", delete(delete_column))
        .route("/{id}", patch(patch_column))
        .route("/{id}/dump", post(dump_column))
}

async fn get_columns(
    State(state): State<AppState>,
) -> Result<Json<HashMap<ColumnId, Column>>, StatusCode> {
    services::column::get(&state.pool).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|columns| Json(columns))
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

async fn dump_column(
    State(state): State<AppState>,
    Path(id): Path<ColumnId>,
    Json(payload): Json<ColumnDumpingPayload>
) -> Result<StatusCode, StatusCode> {
    services::column::dump(&state.pool, &id, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}
