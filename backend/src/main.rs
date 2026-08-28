mod routes;
mod models;
mod services;
mod dtos;

use axum::Router;
use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use std::{env, str::FromStr};
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    pool: SqlitePool,
}

#[tokio::main]
async fn main() {
    let db_url = env::var("DATABASE_URL").unwrap_or(String::from("sqlite://planner.db?mode=rwc"));
    let db_options = SqliteConnectOptions::from_str(&db_url)
        .expect("Database URL error.")
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal);
    
    let pool = sqlx::SqlitePool::connect_with(db_options).await
        .expect("Failed to connect to database.");

    sqlx::migrate!("./migrations")
        .run(&pool).await
        .expect("Failed running migrations");

    let app = Router::new()
        .merge(routes::app_router())
        .layer(CorsLayer::permissive())
        .with_state(AppState{ pool });

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

