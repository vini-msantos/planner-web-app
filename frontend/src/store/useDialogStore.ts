import type { DeleteDialogData } from "@/components/layout/DeleteDialog"
import type { ColumnCreationDialogData } from "@/features/boards/ColumnCreationsDialog"
import type { Board } from "@/types/models"
import { create } from "zustand"

type ActiveDialog =
  | { state: 'none' }
  | { state: 'createBoard' }
  | { state: 'createColumn', data: ColumnCreationDialogData }
  | { state: 'delete', data: DeleteDialogData }
  | { state: 'editBoard', board: Board }

type DialogState = {
  active: ActiveDialog
  closeDialog: () => void,
  showDeleteDialog: (data: DeleteDialogData) => void
  showBoardCreationDialog: () => void
  showColumnCreationDialog: (data: ColumnCreationDialogData) => void
  showBoardEditingDialog: (board: Board) => void
}

const useDialogStore = create<DialogState>()((set) => ({
  active: { state: 'none' },
  closeDialog: () => set({ active: { state: 'none' } }),
  showDeleteDialog: (data: DeleteDialogData) => set({ active: { state: 'delete', data } }),
  showBoardCreationDialog: () => set({ active: { state: 'createBoard' } }),
  showBoardEditingDialog: (board) => set({ active: { state: 'editBoard', board } }),
  showColumnCreationDialog: (data: ColumnCreationDialogData) => set({ active: { state: 'createColumn', data } })
}))

export default useDialogStore
