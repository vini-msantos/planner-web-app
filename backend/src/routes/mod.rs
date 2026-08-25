use axum::Router;

use crate::AppState;

mod root;
mod task;
mod board;
mod column;

pub fn app_router() -> Router<AppState> {
    Router::new()
        .merge(root::router())
        .nest("/task", task::router())
        .nest("/board", board::router())
        .nest("/column", column::router())
}
