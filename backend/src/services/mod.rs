pub mod task;
pub mod board;
pub mod column;

use std::collections::HashMap;
use crate::models::*;

use serde::Serialize;
use sqlx::SqlitePool;

#[derive(Serialize)]
pub struct BootstrapData {
    pub boards: HashMap<BoardId, Board>,
    pub columns: HashMap<ColumnId, Column>,
    pub tasks: HashMap<TaskId, Task>,
    pub scheduled_activities: HashMap<String, ScheduledActivity>,
    pub routines: HashMap<RoutineId, Routine>,
    pub routine_activities: HashMap<String, RoutineActivity> ,
}

pub async fn fetch_bootstrap(pool: &SqlitePool) -> anyhow::Result<BootstrapData> {
    let boards =
        sqlx::query_as!(Board, "SELECT * FROM boards;").fetch_all(pool).await?
        .into_iter().map(|b| (b.id.clone(), b)).collect();

    let columns =
        sqlx::query_as!(Column, "SELECT * FROM columns;").fetch_all(pool).await?
        .into_iter().map(|c| (c.id.clone(), c)).collect();

    let tasks =
        sqlx::query_as_unchecked!(Task, "SELECT * FROM tasks;").fetch_all(pool).await?
        .into_iter().map(|t| (t.id.clone(), t)).collect();

    let scheduled_activities =
        sqlx::query_as!(ScheduledActivity, "SELECT * FROM scheduled_activities;").fetch_all(pool).await?
        .into_iter().map(|sa| (sa.id.clone(), sa)).collect();

    let routines =
        sqlx::query_as!(Routine, "SELECT * FROM routines;").fetch_all(pool).await?
        .into_iter().map(|r| (r.id.clone(), r)).collect();

    let routine_activities =
        sqlx::query_as!(RoutineActivity, "SELECT * FROM routine_activities;").fetch_all(pool).await?
        .into_iter().map(|ra| (ra.id.clone(), ra)).collect();

    Ok(BootstrapData { boards, columns, tasks, scheduled_activities, routines, routine_activities })
}
