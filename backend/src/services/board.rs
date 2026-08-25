use sqlx::{SqlitePool, query};

use crate::dtos::{BoardCreationPayload, BoardPatchPayload};

pub async fn create(pool: &SqlitePool, payload: BoardCreationPayload) -> anyhow::Result<()> {
    query!(
        r#"INSERT INTO boards (id, name) VALUES ($1, $2);"#,
        &payload.id, &payload.name
    ).execute(pool).await?;
    Ok(())
}

pub async fn delete(pool: &SqlitePool, id: &str) -> anyhow::Result<()> {
    query!(r#"DELETE FROM boards WHERE id = $1;"#, id).execute(pool).await?;
    Ok(())
}

pub async fn patch(pool: &SqlitePool, id: &str, payload: BoardPatchPayload) -> anyhow::Result<()> {
    query!(
        r#"
        UPDATE boards SET
            name = COALESCE($1, name)
        WHERE id = $2;
        "#,
        &payload.name, id
    ).execute(pool).await?;
    Ok(())
}
