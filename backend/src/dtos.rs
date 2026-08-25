use chrono::NaiveDateTime;
use serde::Deserialize;

use crate::models::{BoardId, ColumnId, TaskId};

#[derive(Debug, Deserialize)]
pub struct TaskCreationPayload {
    pub id: TaskId,
    pub title: String,
    pub description: String,
    pub due_date: Option<NaiveDateTime>,
    pub position: f64,
    pub column_id: ColumnId,
}

#[derive(Debug, Deserialize)]
pub struct TaskMovePayload {
    pub to_column: ColumnId,
    pub to_position: f64,
}

#[derive(Debug, Deserialize)]
pub struct TaskPatchPayload {
    pub title: Option<String>,
    pub description: Option<Option<String>>,
    pub completed: Option<bool>,
    pub due_date: Option<Option<NaiveDateTime>>,
    pub position: Option<f64>
}

#[derive(Debug, Deserialize)]
pub struct ColumnPatchPayload {
    pub name: Option<String>,
    pub position: Option<f64>,
    pub completes_tasks: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ColumnRoutingPayload {
    pub routes_to: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ColumnCreationPayload {
    pub id: ColumnId,
    pub name: String,
    pub position: f64,
    pub board_id: BoardId,
}

#[derive(Debug, Deserialize)]
pub struct BoardCreationPayload {
    pub id: BoardId,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct BoardPatchPayload {
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RoutinePatchPayload {
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ScheduledActivity {
    pub name: Option<String>,
    pub task_id: Option<Option<TaskId>>,
    pub starts_on: Option<NaiveDateTime>,
    pub duration_minutes: Option<i64>,
}
