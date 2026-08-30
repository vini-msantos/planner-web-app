import type { Board, Column, Task, ScheduledActivity, Routine, RoutineActivity } from "./models"

export type Bootstrap = {
  boards: Record<string, Board>
  columns: Record<string, Column>
  tasks: Record<string, Task>
  scheduled_activities: Record<string, ScheduledActivity>
  routines: Record<string, Routine>
  routine_activities: Record<string, RoutineActivity>
}

export type BoardDto = {
  board: Board
  columns: Record<string, Column>
  tasks: Record<string, Task>
}

export type TaskCreationPayload = {
  id: string
  name: string
  description: string
  due_date?: string
  position: number
  column_id: string
}

export type TaskDumpPayload = {
  to_column: string
  to_position: number
}

export type TaskPatchPayload = {
  title?: string
  description?: string
  column_id?: string,
  update_due_date: boolean,
  due_date?: string,
  position?: number
}

export type ColumnPatchPayload = {
  name?: string
  description?: string,
  position?: number
  completes_tasks?: boolean
}

export type ColumnDumpingPayload = {
  to: string
}

export type TaskDumpingPayload = {
  to_column: string
}

export type ColumnCreationPayload = {
  id: string
  name: string
  position: number
  description: string,
  board_id: string
  completes_tasks: boolean
}

export type BoardCreationPayload = {
  id: string
  name: string
  description: string,
}

export type BoardPatchPayload = {
  name?: string
  description?: string,
  pinned?: boolean
}

export type RoutinePatchPayload = {
  name?: string
}

export type ScheduledActivityPatchPayload = {
  name: string
  task_id?: string | null
  starts_on?: Date
  duration_minutes: number
}
