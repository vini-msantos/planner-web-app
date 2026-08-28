use std::collections::HashMap;

use anyhow::bail;
use sqlx::{SqlitePool, query, query_as, query_as_unchecked};

use crate::{dtos::{ColumnCreationPayload, ColumnPatchPayload, ColumnRoutingPayload, TaskMovePayload}, models::{Column, ColumnId, Task}, services};

pub async fn get(pool: &SqlitePool) -> anyhow::Result<HashMap<ColumnId, Column>> {
    let columns = sqlx::query_as!(Column, r#"SELECT * FROM columns;"#)
        .fetch_all(pool).await?
        .into_iter().map(|column| (column.id.clone(), column)).collect();
    Ok(columns)
}

pub async fn create(pool: &SqlitePool, payload: ColumnCreationPayload) -> anyhow::Result<()> {
    let tasks_hidden = payload.routes_to.is_some();
    let completes_tasks = payload.completes_tasks && !payload.routes_to.is_some();
    
    query!(
        r#"INSERT INTO columns (id, name, description, position, board_id, completes_tasks, tasks_hidden)
        VALUES ($1, $2, $3, $4, $5, $6, $7);"#,
        &payload.id, &payload.name, &payload.description, &payload.position, &payload.board_id, completes_tasks, tasks_hidden
    ).execute(pool).await?;

    if payload.routes_to.is_some() {
        set_routing(pool, &payload.id, ColumnRoutingPayload { routes_to: payload.routes_to }).await?;
    }
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
            completes_tasks = COALESCE($4, completes_tasks),
            tasks_hidden = COALESCE($5, tasks_hidden)
        WHERE id = $6;
        "#,
        &payload.name, &payload.description, &payload.position, &payload.completes_tasks, &payload.tasks_hidden, id
    ).execute(pool).await?;
    Ok(())
}

pub async fn set_routing(pool: &SqlitePool, id: &str, payload: ColumnRoutingPayload) -> anyhow::Result<()> {
    if let Some(dest_col_id) = payload.routes_to {
        if dest_col_id == id { bail!("Can't route column to itself.") }
        let chaining_routes = query_as!(Column, r#"SELECT * FROM columns WHERE id = $1;"#, dest_col_id)
            .fetch_one(pool).await?.routes_to.is_some();
        if chaining_routes { bail!("Can't route to another routing column.") }

        query!(r#"UPDATE columns SET routes_to = $1 WHERE id = $2;"#, &dest_col_id, id)
            .execute(pool).await?;
    
        let tasks = query_as_unchecked!(Task, r#"SELECT * FROM tasks WHERE column_id = $1;"#, id)
            .fetch_all(pool).await?;

        let tail_pos = query_as_unchecked!(Task, r#"SELECT * FROM tasks WHERE column_id = $1;"#, dest_col_id)
            .fetch_all(pool).await?.len() as f64 * 1000.0 + 1000.0;

        for (index, task) in tasks.iter().enumerate() {
            let to_position = tail_pos + index as f64 * 1000.0;
            services::task::move_to(pool, &task.id, TaskMovePayload { to_column: dest_col_id.clone(), to_position }).await?;
        }
    } else {
        query!(r#"UPDATE columns SET routes_to = NULL WHERE id = $1;"#, id).execute(pool).await?;
    }
    Ok(())
}
