
use std::collections::HashMap;

use chrono::Utc;
use sqlx::{Encode, QueryBuilder, Sqlite, SqlitePool, Type, query, query_as};

use crate::{dtos::{BoardCreationPayload, BoardDTO, BoardPatchPayload}, models::{Board, BoardId, Column, ColumnId, Task}};

fn query_in<'a, T: Encode<'a, Sqlite> + Type<Sqlite>>(query: &str, list: &[T]) -> QueryBuilder<Sqlite> {
    let placeholder = format!("IN ({})", vec!["?"; list.len()].join(", "));
    let mut query = QueryBuilder::new(query.replacen("= ANY({})", &placeholder, 1));
    for v in list {
        query.push_bind(v);
    }
    return query
}

pub async fn get(pool: &SqlitePool, id: &str) -> anyhow::Result<BoardDTO> {
    let board = sqlx::query_as!(Board, r#"SELECT * FROM boards WHERE id = $1;"#, id)
        .fetch_one(pool).await?;
    let column_list = sqlx::query_as!(Column, r#"SELECT * FROM columns WHERE board_id = $1;"#, &board.id)
        .fetch_all(pool).await?;

    let routed_ids: Vec<ColumnId> = column_list.iter().filter_map(|c| c.routes_to.clone()).collect();
    let column_ids: Vec<ColumnId> = column_list.iter().map(|c| c.id.clone()).collect();
    let ids = vec![routed_ids.clone(), column_ids.clone()].concat();

    let routed_query =
        query_in(r#"SELECT * FROM columns WHERE id = ANY({});"#, &routed_ids);
    let routed_columns = query_as::<_, Column>(dbg!(routed_query.sql()))
        .fetch_all(pool).await?.into_iter().map(move |rc| (rc.id.clone(), rc)).collect();

    let tasks_query =
        query_in(r#"SELECT * FROM tasks WHERE id = ANY({});"#, &ids);
    let tasks = query_as::<_, Task>(dbg!(tasks_query.sql()))
        .fetch_all(pool).await?.into_iter().map(move |t| (t.id.clone(), t)).collect();
    
    let columns = column_list.into_iter().map(move |c| (c.id.clone(), c)).collect();
    return Ok(BoardDTO { board, columns, routed_columns, tasks })
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
