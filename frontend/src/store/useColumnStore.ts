import { createRequest, deleteRequest, getRequest, patchRequest } from '@/api'
import type { ColumnCreationPayload, ColumnPatchPayload } from '@/types/dtos'
import type { Column } from '@/types/models'
import { err, ok, type ApiResult } from '@/utils/result'
import { create } from 'zustand'

type GenericError = 'timedOut' | 'badRequest'
type UseColumnsError = GenericError
type ColumnPatchError = GenericError | 'invalidName' | 'noSuchId'
type ColumnDeletionError = GenericError | 'noSuchId'
type ColumnCreationError = GenericError | 'invalidName'

type ColumnStore = {
  loaded: boolean,
  error?: UseColumnsError,
  columns: Record<string, Column>,
  patchColumn: (id: string, patch: ColumnPatchPayload) => ApiResult<null, ColumnPatchError>,
  createColumn: (payload: ColumnCreationPayload) => ApiResult<null, ColumnCreationError>
  deleteColumn: (id: string) => ApiResult<null, ColumnDeletionError>,
}

const useColumnStore = create<ColumnStore>()(
  (set, get) => {
    const fetchColumns = async () => {
      const result = await getRequest<Record<string, Column>>("columns")
      if (result == 'error') return set({error: 'timedOut'})
      console.log(result)
      set({columns: result})
    }

    fetchColumns()

    return {
      loaded: false,
      columns: {},
      patchColumn: async (id, patch): ApiResult<null, ColumnPatchError> => {
        const result = await patchRequest("columns", id, patch)
        if (result == 'ok') fetchColumns()
        return result != 'error'? ok(null) : err('noSuchId') 
      },
      deleteColumn: async (id): ApiResult<null, ColumnDeletionError> => {
        const result = await deleteRequest("columns", id)
        if (result == 'ok') fetchColumns()
        return result != 'error'? ok(null) : err('noSuchId') 
      },
      createColumn: async (payload): ApiResult<null, ColumnCreationError> => {
        if (get().columns[payload.id] != undefined) return err('invalidName')
        const result = await createRequest("columns", payload)
        if (result == 'ok') fetchColumns()
        return result != 'error' ? ok(null) : err('badRequest') 
      },
    }
  }
)

export default useColumnStore
