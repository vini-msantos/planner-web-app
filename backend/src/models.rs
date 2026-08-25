use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

pub type ColumnId = String;
pub type RoutineId = String;
pub type BoardId = String;
pub type TaskId = String;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Board {
    pub id: BoardId,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Column {
    pub id: ColumnId,
    pub name: String,
    pub position: f64,
    pub routes_to: Option<ColumnId>,
    pub tasks_hidden: bool,
    pub completes_tasks: bool,
    pub board_id: BoardId,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Task {
    pub id: TaskId,
    pub title: String,
    pub description: String,
    pub due_date: Option<NaiveDateTime>,
    pub position: f64,
    pub column_id: ColumnId,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ScheduledActivity {
    pub id: String,
    pub name: String,
    pub task_id: Option<TaskId>,
    pub starts_on: NaiveDateTime,
    pub duration_minutes: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Routine {
    pub id: RoutineId,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RoutineActivity {
    pub id: String,
    pub name: String,
    pub day_of_week: i64,
    pub time_minutes: i64,
    pub duration_minutes: i64,
    pub routine_id: RoutineId
}
