use std::collections::HashMap;


use sqlx::{SqlitePool, query, query_as_unchecked};

use crate::dtos::{TaskCreationPayload, TaskPatchPayload};
use crate::models::{Task, TaskId};

pub async fn get(pool: &SqlitePool) -> anyhow::Result<HashMap<TaskId, Task>> {
    let tasks = sqlx::query_as!(Task, r#"SELECT * FROM tasks;"#)
        .fetch_all(pool).await?
        .into_iter().map(|task| (task.id.clone(), task)).collect();
    Ok(tasks)
}

pub async fn patch(pool: &SqlitePool, id: &str, payload: TaskPatchPayload) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        UPDATE tasks SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            position = COALESCE($3, position),
            column_id = COALESCE($4, column_id),
            due_date = CASE
                WHEN $5 IS TRUE THEN $6
               ELSE due_date
            END
        WHERE id = $7;
        "#,
        &payload.name,
        &payload.description,
        &payload.position,
        &payload.column_id,
        &payload.update_due_date,
        &payload.due_date,
        id,
    ).execute(pool).await?;
    Ok(())
}

pub async fn post(pool: &SqlitePool, payload: TaskCreationPayload) -> anyhow::Result<()> {
    dbg!(&payload.due_date);
    query!(
        r#"
        INSERT INTO tasks (id, name, description, due_date, position, column_id)
        VALUES ($1, $2, $3, $4, $5, $6);
        "#,
        &payload.id,
        &payload.name,
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

pub async fn dump(pool: &SqlitePool, ids: &[String], to_column: &str) -> anyhow::Result<()> {
    let tail_pos = query_as_unchecked!(Task, r#"SELECT * FROM tasks WHERE column_id = $1;"#, to_column)
        .fetch_all(pool).await?.iter()
        .map(|t| t.position)
        .fold(1000f64, |prev, curr| prev.max(curr));
    
    for (index, id) in ids.iter().enumerate() {
        let position = tail_pos + index as f64 * 1000.0;
        query!(r#"
            UPDATE tasks SET position = $1, column_id = $2 WHERE id = $3;
        "#, &position, &to_column, &id).execute(pool).await?;
    }
    Ok(())
}
