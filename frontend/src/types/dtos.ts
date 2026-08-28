import type { Board, Column, Task, ScheduledActivity, Routine, RoutineActivity } from "./models"

export type Bootstrap = {
  boards: Record<string, Board>
  columns: Record<string, Column>
  tasks: Record<string, Task>
  scheduled_activities: Record<string, ScheduledActivity>
  routines: Record<string, Routine>
  routine_activities: Record<string, RoutineActivity>
}

export type TaskCreationPayload = {
  id: string
  title: string
  description: string
  due_date?: Date
  position: number
  column_id: string
}

export type TaskMovePayload = {
  to_column: string
  to_position: number
}

export type TaskPatchPayload = {
  title?: string
  description?: string
  due_date?: Date | null
  position?: number
}

export type ColumnPatchPayload = {
  name?: string
  description?: string,
  position?: number
  completes_tasks?: boolean
  tasks_hidden?: boolean
}

export type ColumnRoutingPayload = {
  routes_to: string | null
}

export type ColumnCreationPayload = {
  id: string
  name: string
  position: number
  description: string,
  board_id: string
  routes_to?: string
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
