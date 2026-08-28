use std::collections::HashMap;

use axum::{Json, Router, extract::{Path, State}, http::StatusCode, routing::{delete, get, patch, post}};

use crate::{AppState, dtos::{BoardCreationPayload, BoardDTO, BoardPatchPayload}, models::{Board, BoardId}, services};

pub fn router() -> Router<crate::AppState> {
    Router::new()
        .route("/", get(get_boards))
        .route("/", post(post_board))
        .route("/{id}", delete(delete_board))
        .route("/{id}", get(get_board))
        .route("/{id}", patch(patch_board))
}

async fn post_board(
    State(state): State<AppState>,
    Json(payload): Json<BoardCreationPayload>
) -> Result<StatusCode, StatusCode> {
    services::board::create(&state.pool, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::CREATED)
}

async fn get_boards(
    State(state): State<AppState>,
) -> Result<Json<HashMap<BoardId, Board>>, StatusCode> {
    services::board::get_all(&state.pool).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|boards| Json(boards))
}

async fn get_board(
    State(state): State<AppState>,
    Path(id): Path<String>
) -> Result<Json<BoardDTO>, StatusCode> {
    services::board::get(&state.pool, &id).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|board| Json(board))
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
