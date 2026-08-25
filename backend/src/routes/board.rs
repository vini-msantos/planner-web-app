use axum::{Json, Router, extract::{Path, State}, http::StatusCode, routing::{delete, patch, post}};

use crate::{AppState, dtos::{BoardCreationPayload, BoardPatchPayload}, models::BoardId, services};

pub fn router() -> Router<crate::AppState> {
    Router::new()
        .route("/", post(post_board))
        .route("/{id}", delete(delete_board))
        .route("/{id}", patch(patch_board))
}

async fn post_board(
    State(state): State<AppState>,
    Json(payload): Json<BoardCreationPayload>
) -> Result<StatusCode, StatusCode> {
    services::board::create(&state.pool, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::CREATED)
}

async fn delete_board(
    State(state): State<AppState>,
    Path(id): Path<BoardId>,
) -> Result<StatusCode, StatusCode> {
    services::board::delete(&state.pool, &id).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}

async fn patch_board(
    State(state): State<AppState>,
    Path(id): Path<BoardId>,
    Json(payload): Json<BoardPatchPayload>
) -> Result<StatusCode, StatusCode> {
    services::board::patch(&state.pool, &id, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}
