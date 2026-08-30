use std::collections::HashMap;

use chrono::Utc;
use sqlx::{AssertSqlSafe, SqlitePool, query, query_as};

use crate::{dtos::{BoardCreationPayload, BoardDTO, BoardPatchPayload}, models::{Board, BoardId, Column, Task}};

fn multi_id_query(query: &str, list: &[String]) -> String {
    let ids = list.iter().map(|n| format!("'{n}'")).collect::<Vec<String>>().join(", ");
    query.replacen("= ANY({})", &format!("IN ({ids})"), 1)
}

pub async fn get(pool: &SqlitePool, id: &str) -> anyhow::Result<BoardDTO> {
    let board = sqlx::query_as!(Board, r#"SELECT * FROM boards WHERE id = $1;"#, id)
        .fetch_one(pool).await?;
    let columns: HashMap<String, Column> =
        sqlx::query_as!(Column, r#"SELECT * FROM columns WHERE board_id = $1;"#, &board.id)
        .fetch_all(pool).await?.into_iter().map(|c| (c.id.clone(), c)).collect();

    let column_ids: Vec<String> = columns.iter().map(|(id, _)| id.clone()).collect();

    let tasks_query =
        multi_id_query(r#"SELECT * FROM tasks WHERE column_id = ANY({});"#, &column_ids);
    let tasks = query_as::<_, Task>(AssertSqlSafe(tasks_query))
        .fetch_all(pool).await?.into_iter().map(|t| (t.id.clone(), t)).collect();
   
    return Ok(BoardDTO { board, columns, tasks })
}

pub async fn get_all(pool: &SqlitePool) -> anyhow::Result<HashMap<BoardId, Board>> {
    let boards = sqlx::query_as!(Board, r#"SELECT * FROM boards;"#)
        .fetch_all(pool).await?.into_iter().map(|b| (b.id.clone(), b)).collect();
    Ok(boards)
}

pub async fn create(pool: &SqlitePool, payload: BoardCreationPayload) -> anyhow::Result<()> {
    query!(
        r#"INSERT INTO boards (id, name, description) VALUES ($1, $2, $3);"#,
        &payload.id, &payload.name, &payload.description
    ).execute(pool).await?;
    Ok(())
}

pub async fn delete(pool: &SqlitePool, id: &str) -> anyhow::Result<()> {
    query!(r#"DELETE FROM boards WHERE id = $1;"#, id).execute(pool).await?;
    Ok(())
}

pub async fn patch(pool: &SqlitePool, id: &str, payload: BoardPatchPayload) -> anyhow::Result<()> {
    let pin = if payload.pinned.is_some_and(|p| p) { Some(Utc::now()) } else { None };
    query!(
        r#"
        UPDATE boards SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            pinned = $3
        WHERE id = $4;
        "#,
        &payload.name, &payload.description, pin, id
    ).execute(pool).await?;
    Ok(())
}
