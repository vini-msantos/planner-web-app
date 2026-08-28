use axum::Router;

use crate::AppState;

mod root;
mod task;
mod board;
mod column;

pub fn app_router() -> Router<AppState> {
    Router::new()
        .merge(root::router())
        .nest("/tasks", task::router())
        .nest("/boards", board::router())
        .nest("/columns", column::router())
}
