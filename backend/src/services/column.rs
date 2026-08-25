use anyhow::{Error, bail};
use sqlx::{SqlitePool, query, query_as, query_as_unchecked};

use crate::{dtos::{ColumnCreationPayload, ColumnPatchPayload, ColumnRoutingPayload, TaskMovePayload}, models::{Column, Task}, services};

pub async fn create(pool: &SqlitePool, payload: ColumnCreationPayload) -> anyhow::Result<()> {
    query!(
        r#"INSERT INTO columns (id, name, position, board_id) VALUES ($1, $2, $3, $4);"#,
        &payload.id, &payload.name, &payload.position, &payload.board_id
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
            position = COALESCE($2, position),
            completes_tasks = COALESCE($3, completes_tasks)
        WHERE id = $4;
        "#,
        &payload.name, &payload.position, &payload.completes_tasks, id
    ).execute(pool).await?;

    if payload.completes_tasks.unwrap_or(false) {
        query!(r#"UPDATE tasks SET completed = TRUE WHERE column_id = $1;"#, id)
        .execute(pool).await?;        
    }

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
            services::task::move_to(pool, &task.id, TaskMovePayload { to_column: dest_col_id.clone(), to_position });
        }
    } else {
        query!(r#"UPDATE columns SET routes_to = NULL WHERE id = $1;"#, id).execute(pool).await?;
    }
    Ok(())
}
