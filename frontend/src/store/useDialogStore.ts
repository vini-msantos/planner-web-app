import type { DeleteDialogData } from "@/components/layout/DeleteDialog"
import type { ColumnCreationDialogData } from "@/features/columns/ColumnCreationDialog"
import type { TaskCreationDialogData } from "@/features/tasks/TaskCreationsDialog"
import type { Board, Column, Task } from "@/types/models"
import { create } from "zustand"

type ActiveDialog =
  | { state: 'none' }
  | { state: 'createBoard' }
  | { state: 'createColumn', data: ColumnCreationDialogData }
  | { state: 'createTask', data: TaskCreationDialogData }
  | { state: 'delete', data: DeleteDialogData }
  | { state: 'editBoard', board: Board }
  | { state: 'editTask', task: Task }
  | { state: 'editColumn', column: Column }

type DialogState = {
  active: ActiveDialog
  closeDialog: () => void,
  showDeleteDialog: (data: DeleteDialogData) => void
  showBoardCreationDialog: () => void
  showColumnCreationDialog: (data: ColumnCreationDialogData) => void
  showTaskCreationDialog: (data: TaskCreationDialogData) => void
  showBoardEditingDialog: (board: Board) => void
  showTaskEditingDialog: (task: Task) => void,
  showColumnEditingDialog: (column: Column) => void,
}

const useDialogStore = create<DialogState>()((set) => ({
  active: { state: 'none' },
  closeDialog: () => set({ active: { state: 'none' } }),
  showDeleteDialog: (data: DeleteDialogData) => set({ active: { state: 'delete', data } }),
  showBoardCreationDialog: () => set({ active: { state: 'createBoard' } }),
  showBoardEditingDialog: (board) => set({ active: { state: 'editBoard', board } }),
  showTaskEditingDialog: (task) => set({ active: { state: 'editTask', task } }),
  showColumnEditingDialog: (column) => set({ active: { state: 'editColumn', column } }),
  showColumnCreationDialog: (data: ColumnCreationDialogData) => set({ active: { state: 'createColumn', data } }),
  showTaskCreationDialog: (data: TaskCreationDialogData) => set({ active: { state: 'createTask', data } }),
}))

export default useDialogStore
