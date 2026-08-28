export type Board = {
    id: string,
    name: string,
    description: string,
    pinned?: Date,
}

export type Column = {
    id: string,
    name: string,
    description: string,
    position: number,
    routes_to?: string,
    tasks_hidden: boolean,
    completes_tasks: boolean,
    board_id: string,
}

export type Task = {
    id: string,
    name: string,
    description: string,
    due_date?: Date,
    position: number,
    column_id: string,
}

export type ScheduledActivity = {
    id: string,
    name: string,
    task_id?: string,
    starts_on: Date,
    duration_minutes: number,
}

export type Routine = {
    id: string,
    name: string,
}

export type RoutineActivity = {
    id: string,
    name: string,
    day_of_week: number,
    time_minutes: number,
    duration_minutes: number,
    routine_id: string
}
