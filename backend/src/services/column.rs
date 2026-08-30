use std::collections::HashMap;

use sqlx::{SqlitePool, query, query_as_unchecked};

use crate::{dtos::{ColumnCreationPayload, ColumnDumpingPayload, ColumnPatchPayload}, models::{Column, ColumnId, Task}, services};

pub async fn get(pool: &SqlitePool) -> anyhow::Result<HashMap<ColumnId, Column>> {
    let columns = sqlx::query_as!(Column, r#"SELECT * FROM columns;"#)
        .fetch_all(pool).await?
        .into_iter().map(|column| (column.id.clone(), column)).collect();
    Ok(columns)
}

pub async fn create(pool: &SqlitePool, payload: ColumnCreationPayload) -> anyhow::Result<()> {
 
    query!(
        r#"INSERT INTO columns (id, name, description, position, board_id, completes_tasks )
        VALUES ($1, $2, $3, $4, $5, $6);"#,
        &payload.id, &payload.name, &payload.description, &payload.position, &payload.board_id, &payload.completes_tasks 
    ).execute(pool).await?;
    Ok(())
}

pub async fn delete(pool: &SqlitePool, id: &str) -> anyhow::Result<()> {
    query!(r#"DELETE FROM columns WHERE id = $1;"#, id).execute(pool).await?;
    Ok(())
}

pub async fn patch(pool: &SqlitePool, id: &str, payload: ColumnPatchPayload) -> anyhow::Result<()> {
    query!(
        r#"
        UPDATE columns SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            position = COALESCE($3, position),
            completes_tasks = COALESCE($4, completes_tasks)
        WHERE id = $5;
        "#,
        &payload.name, &payload.description, &payload.position, &payload.completes_tasks, id
    ).execute(pool).await?;
    Ok(())
}

pub async fn dump(pool: &SqlitePool, id: &str, payload: ColumnDumpingPayload) -> anyhow::Result<()> {
    if payload.to == id { return Ok(()); }

    let task_ids: Vec<String> = query_as_unchecked!(Task, r#"SELECT * FROM tasks WHERE column_id = $1;"#, id)
        .fetch_all(pool).await?.into_iter()
        .map(|t| t.id).collect();
    services::task::dump(pool, &task_ids, &payload.to).await?;

    Ok(())
}
