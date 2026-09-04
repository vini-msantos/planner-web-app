use std::collections::HashMap;

use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};

use crate::models::{Board, BoardId, Column, ColumnId, Task, TaskId};

#[derive(Debug, Serialize)]
pub struct BoardDTO {
    pub board: Board,
    pub columns: HashMap<ColumnId, Column>,
    pub tasks: HashMap<TaskId, Task>,
}

#[derive(Debug, Deserialize)]
pub struct TaskCreationPayload {
    pub id: TaskId,
    pub name: String,
    pub description: String,
    pub due_date: Option<DateTime<Local>>,
    pub position: f64,
    pub column_id: ColumnId,
}

#[derive(Debug, Deserialize)]
pub struct TaskDumpingPayload {
    pub to_column: ColumnId,
}

#[derive(Debug, Deserialize)]
pub struct TaskPatchPayload {
    pub name: Option<String>,
    pub description: Option<String>,
    #[serde(default)]
    pub update_due_date: bool,
    pub due_date: Option<DateTime<Local>>,
    pub column_id: Option<String>,
    pub position: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct ColumnPatchPayload {
    pub name: Option<String>,
    pub position: Option<f64>,
    pub description: Option<String>,
    pub completes_tasks: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ColumnCreationPayload {
    pub id: ColumnId,
    pub name: String,
    pub description: String,
    pub position: f64,
    pub board_id: BoardId,
    pub completes_tasks: bool,
}

#[derive(Debug, Deserialize)]
pub struct ColumnDumpingPayload {
    pub to: ColumnId,
}

#[derive(Debug, Deserialize)]
pub struct BoardCreationPayload {
    pub id: BoardId,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Deserialize)]
pub struct BoardPatchPayload {
    pub name: Option<String>,
    pub description: Option<String>,
    pub pinned: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct RoutinePatchPayload {
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ScheduledActivityPatchPayload {
    pub name: Option<String>,
    #[serde(default)]
    pub update_task_id: bool,
    pub task_id: Option<TaskId>,
    pub starts_on: Option<DateTime<Local>>,
    pub duration_minutes: Option<i64>,
}
