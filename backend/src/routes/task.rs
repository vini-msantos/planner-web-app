use std::collections::HashMap;

use axum::{Json, Router, extract::{Path, State}, http::StatusCode, routing::{delete, get, patch, post}};

use crate::{AppState, dtos::{TaskCreationPayload, TaskMovePayload, TaskPatchPayload}, models::{Task, TaskId}, services};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(post_task))
        .route("/", get(get_tasks))
        .route("/{id}", patch(patch_task))
        .route("/{id}", delete(delete_task))
        .route("/{id}/move", post(move_task))
}

async fn get_tasks(
    State(state): State<AppState>,
) -> Result<Json<HashMap<TaskId, Task>>, StatusCode> {
    services::task::get(&state.pool).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|tasks| Json(tasks))
}

async fn patch_task(
    State(state): State<AppState>,
    Path(id): Path<TaskId>,
    Json(payload): Json<TaskPatchPayload>
) -> Result<StatusCode, StatusCode> {
    services::task::patch(&state.pool, &id, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}

async fn delete_task(
    State(state): State<AppState>,
    Path(id): Path<TaskId>,
) -> Result<StatusCode, StatusCode> {
    services::task::delete(&state.pool, &id).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}

async fn post_task(
    State(state): State<AppState>,
    Json(payload): Json<TaskCreationPayload>
) -> Result<StatusCode, StatusCode> {
    services::task::post(&state.pool, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::CREATED)
}

async fn move_task(
    State(state): State<AppState>,
    Path(id): Path<TaskId>,
    Json(payload): Json<TaskMovePayload>
) -> Result<StatusCode, StatusCode> {
    services::task::move_to(&state.pool, &id, payload).await.map_err(|_| StatusCode::BAD_REQUEST)
    .map(|_| StatusCode::OK)
}
