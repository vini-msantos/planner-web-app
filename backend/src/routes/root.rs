use axum::{Json, Router, extract::State, http::StatusCode, routing::get};

use crate::{AppState, services::{BootstrapData, fetch_bootstrap}};


pub fn router() -> Router<AppState> {
    return Router::new().route("/", get(get_bootstrap));
}
    
async fn get_bootstrap(State(state): State<AppState>) -> Result<Json<BootstrapData>, StatusCode> {
    let bootstrap = fetch_bootstrap(&state.pool).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(bootstrap))
}
