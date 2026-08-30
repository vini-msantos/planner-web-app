PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY not NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  pinned DATETIME
);

CREATE TABLE IF NOT EXISTS columns (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position REAL NOT NULL,
  completes_tasks BOOLEAN NOT NULL CHECK (completes_tasks IN (0, 1)),
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date DATETIME,
  position REAL NOT NULL,
  column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduled_activities (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  starts_on DATETIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routine_activities (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- De segunda à domingo.
  time_minutes INTEGER NOT NULL CHECK (time_minutes >= 0 AND time_minutes < 1440), -- Dentro das 24 horas.
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id) WHERE column_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_starts_on ON scheduled_activities(starts_on);
CREATE INDEX IF NOT EXISTS idx_scheduled_task_id ON scheduled_activities(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_routine_activities_routine_id ON routine_activities(routine_id);
