import { createRequest, deleteRequest, fetchBootstrap, getRequest, moveTask, patchRequest, routeColumn } from "@/api"
import type { BoardCreationPayload, BoardPatchPayload, Bootstrap, ColumnCreationPayload, ColumnPatchPayload, ColumnRoutingPayload, TaskCreationPayload, TaskMovePayload, TaskPatchPayload } from "@/types/dtos"
import type { Board, Column, Task } from "@/types/models"
import { create } from "zustand"

type AppState = Bootstrap & {
  fetchBootstrap: () => Promise<'ok' | 'error'>,
  createBoard: (payload: BoardCreationPayload) => Promise<'ok' | 'error'>,
  deleteBoard: (id: string) => Promise<'ok' | 'error'>,
  patchBoard: (id: string, payload: BoardPatchPayload) => Promise<'ok' | 'error'>,
  createColumn: (payload: ColumnCreationPayload) => Promise<'ok' | 'error'>,
  deleteColumn: (id: string) => Promise<'ok' | 'error'>,
  routeColumn: (id: string, payload: ColumnRoutingPayload) => Promise<'ok' | 'error'>,
  patchColumn: (id: string, payload: ColumnPatchPayload) => Promise<'ok' | 'error'>,
  createTask: (payload: TaskCreationPayload) => Promise<'ok' | 'error'>,
  deleteTask: (id: string) => Promise<'ok' | 'error'>,
  patchTask: (id: string, payload: TaskPatchPayload) => Promise<'ok' | 'error'>,
  moveTask: (id: string, payload: TaskMovePayload) => Promise<'ok' | 'error'>,
}

export const useAppStore = create<AppState>()(
  (set) => {
    const fetchBoards = async () => {
      const boards = await getRequest<Board>("boards")
      if (boards == 'error') return 'error'
      set({ boards })
      return 'ok'
    }

    const fetchColumns = async () => {
      const columns = await getRequest<Column>("columns")
      if (columns == 'error') return 'error'
      set({ columns })
      return 'ok'
    }

    const fetchTasks = async () => {
      const tasks = await getRequest<Task>("tasks")
      if (tasks == 'error') return 'error'
      set({ tasks })
      return 'ok'
    }

    return {
      boards: {},
      columns: {},
      tasks: {},
      scheduled_activities: {},
      routines: {},
      routine_activities: {},

      fetchBootstrap: async () => {
        const result = await fetchBootstrap()
        if (result == 'error') return 'error'
        set(result)
        return 'ok'
      },

      createBoard: async (payload) => {
        if (await createRequest("boards", payload) == 'error') return 'error'
        return await fetchBoards()
      },

      deleteBoard: async (id) => {
        if (await deleteRequest("boards", id) == 'error') return 'error'
        if (await fetchTasks() == 'error') return 'error'
        if (await fetchColumns() == 'error') return 'error'
        return await fetchBoards()
      },

      patchBoard: async (id, payload) => {
        if (await patchRequest("boards", id, payload) == 'error') return 'error'
        return await fetchBoards()
      },
      createColumn: async (payload) => {
        if (await createRequest("columns", payload) == 'error') return 'error'
        return await fetchColumns()
      },

      deleteColumn: async (id) => {
        if (await deleteRequest("column", id) == 'error') return 'error'
        if (await fetchColumns() == 'error') return 'error'
        return await fetchTasks()
      },

      routeColumn: async (id, payload) => {
        if (await routeColumn(id, payload) == 'error') return 'error'
        if (await fetchColumns() == 'error') return 'error'
        return await fetchTasks()
      },

      patchColumn: async (id, payload) => {
        if (await patchRequest("columns", id, payload) == 'error') return 'error'
        return await fetchColumns()
      },

      createTask: async (payload) => {
        if (await createRequest("tasks", payload) == 'error') return 'error'
        return await fetchTasks()
      },

      deleteTask: async (id) => {
        if (await deleteRequest("task", id) == 'error') return 'error'
        return await fetchTasks()
      },

      patchTask: async (id, payload) => {
        if (await patchRequest("tasks", id, payload) == 'error') return 'error'
        return await fetchTasks()
      },

      moveTask: async (id, payload) => {
        if (await moveTask(id, payload) == 'error') return 'error'
        return fetchTasks()
      }
    }
  }
)
