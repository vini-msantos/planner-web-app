import { createRequest, deleteRequest, getRequest, patchRequest } from '@/api'
import type { TaskCreationPayload, TaskPatchPayload } from '@/types/dtos'
import type { Task } from '@/types/models'
import { err, ok, type ApiResult } from '@/utils/result'
import { create } from 'zustand'

type GenericError = 'timedOut' | 'badRequest'
type UseTasksError = GenericError
type TaskPatchError = GenericError | 'invalidName' | 'noSuchId'
type TaskDeletionError = GenericError | 'noSuchId'
type TaskCreationError = GenericError | 'invalidName'

type TaskStore = {
  loaded: boolean,
  error?: UseTasksError,
  tasks: Record<string, Task>,
  patchTask: (id: string, patch: TaskPatchPayload) => ApiResult<null, TaskPatchError>,
  createTask: (payload: TaskCreationPayload) => ApiResult<null, TaskCreationError>
  deleteTask: (id: string) => ApiResult<null, TaskDeletionError>,
}

const useTaskStore = create<TaskStore>()(
  (set, get) => {
    const fetchTasks = async () => {
      const result = await getRequest<Record<string, Task>>("tasks")
      if (result == 'error') return set({error: 'timedOut'})
      set({tasks: result})
    }

    fetchTasks()

    return {
      loaded: false,
      tasks: {},
      patchTask: async (id, patch): ApiResult<null, TaskPatchError> => {
        const result = await patchRequest("tasks", id, patch)
        if (result == 'ok') fetchTasks()
        return result != 'error'? ok(null) : err('noSuchId') 
      },
      deleteTask: async (id): ApiResult<null, TaskDeletionError> => {
        const result = await deleteRequest("tasks", id)
        if (result == 'ok') fetchTasks()
        return result != 'error'? ok(null) : err('noSuchId') 
      },
      createTask: async (payload): ApiResult<null, TaskCreationError> => {
        if (get().tasks[payload.id] != undefined) return err('invalidName')
        const result = await createRequest("tasks", payload)
        if (result == 'ok') fetchTasks()
        return result != 'error' ? ok(null) : err('badRequest') 
      },
    }
  }
)

export default useTaskStore
