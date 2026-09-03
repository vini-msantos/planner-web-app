import { createRequest, deleteRequest, getRequest, patchRequest } from '@/api'
import type { BoardCreationPayload, BoardPatchPayload } from '@/types/dtos'
import type { Board } from '@/types/models'
import { err, ok, type ApiResult } from '@/utils/result'
import { create } from 'zustand'

type GenericError = 'timedOut' | 'badRequest'
type UseBoardsError = GenericError
type BoardPatchError = GenericError | 'invalidName' | 'noSuchId'
type BoardDeletionError = GenericError | 'noSuchId'
type BoardCreationError = GenericError | 'invalidName'

type BoardStore = {
  loaded: boolean,
  error?: UseBoardsError,
  boards: Record<string, Board>,
  patchBoard: (id: string, patch: BoardPatchPayload) => ApiResult<null, BoardPatchError>,
  createBoard: (payload: BoardCreationPayload) => ApiResult<null, BoardCreationError>
  deleteBoard: (id: string) => ApiResult<null, BoardDeletionError>,
  toggleBoardPin: (id: string) => ApiResult<null, BoardPatchError>
}

const useBoardStore = create<BoardStore>()(
  (set, get) => {
    const fetchBoards = async () => {
      const result = await getRequest<Record<string, Board>>("boards")
      if (result == 'error') return set({error: 'timedOut'})
      set({boards: result})
    }

    fetchBoards()

    const patchBoard = async (id: string, patch: BoardPatchPayload): ApiResult<null, BoardPatchError> => {
      const result = await patchRequest("boards", id, patch)
      if (result == 'ok') fetchBoards()
      return result != 'error'? ok(null) : err('noSuchId') 
    }

    return {
      loaded: false,
      boards: {},
      deleteBoard: async (id): ApiResult<null, BoardDeletionError> => {
        const result = await deleteRequest("boards", id)
        if (result == 'ok') fetchBoards()
        return result != 'error'? ok(null) : err('noSuchId') 
      },
      createBoard: async (payload): ApiResult<null, BoardCreationError> => {
        if (get().boards[payload.id] != undefined) return err('invalidName')
        const result = await createRequest("boards", payload)
        if (result == 'ok') fetchBoards()
        return result != 'error' ? ok(null) : err('badRequest') 
      },
      patchBoard,
      toggleBoardPin: async (id: string) => {
        return await patchBoard(id, { pinned: get().boards[id].pinned == undefined })
      },
    }
  }
)

export default useBoardStore
