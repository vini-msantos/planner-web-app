use anyhow::bail;
use sqlx::{SqlitePool, query, query_as, query_as_unchecked};

use crate::dtos::{TaskCreationPayload, TaskMovePayload, TaskPatchPayload};
use crate::models::{Column, Task};

pub async fn patch(pool: &SqlitePool, id: &str, payload: TaskPatchPayload) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        UPDATE tasks SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            position = COALESCE($3, position),
            due_date = CASE
                WHEN $4 IS TRUE THEN $5
               ELSE due_date
            END
        WHERE id = $6;
        "#,
        &payload.title,
        &payload.description,
        &payload.position,
        &payload.due_date.is_some(),
        &payload.due_date.flatten(),
        id,
    ).execute(pool).await?;
    Ok(())
}

pub async fn post(pool: &SqlitePool, payload: TaskCreationPayload) -> anyhow::Result<()> {
    let routes_to_somewhere = query_as!(
        Column, r#"SELECT * FROM columns WHERE id = $1;"#, &payload.column_id
    ).fetch_one(pool).await?.routes_to.is_some();
    if routes_to_somewhere { bail!("Can't add tasks to a column that routes to somewhere.") }

    query!(
        r#"
        INSERT INTO tasks (id, title, description, due_date, position, column_id)
        VALUES ($1, $2, $3, $4, $5, $6);
        "#,
        &payload.id,
        &payload.title,
        &payload.description,
        &payload.due_date,
        &payload.position,
        &payload.column_id
    ).execute(pool).await?;
    Ok(())
}

pub async fn delete(pool: &SqlitePool, id: &str) -> anyhow::Result<()> {
    query!(r#"DELETE FROM tasks WHERE id = $1;"#, id).execute(pool).await?;
    Ok(())
}

pub async fn move_to(pool: &SqlitePool, id: &str, payload: TaskMovePayload) -> anyhow::Result<()> {
    let dest_col = query_as!(Column,
        r#"SELECT * FROM columns WHERE id = $1;"#,
        &payload.to_column
    ).fetch_one(pool).await?;
    
    let position = if let Some(routes_to) = &dest_col.routes_to {
        query_as_unchecked!(Task, r#"SELECT * FROM tasks WHERE column_id = $1;"#, routes_to)
            .fetch_all(pool).await?.len() as f64 * 1000.0 + 1000.0
    } else { payload.to_position };

    query!(
        r#"
        UPDATE tasks SET
            column_id = COALESCE($1, $2),
            position = $3
        WHERE id = $4;
        "#,
        &dest_col.routes_to,
        &dest_col.id,
        position,
        id
    ).execute(pool).await?;
    Ok(())
}
