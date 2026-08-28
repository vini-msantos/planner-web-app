import type { DeleteDialogData } from "@/components/layout/DeleteDialog"
import { create } from "zustand"


type ActiveDialog = { state: 'none' } | { state: 'createBoard' } | { state: 'delete', data: DeleteDialogData }


type DialogState = {
  active: ActiveDialog
  closeDialog: () => void,
  showDeleteDialog: (data: DeleteDialogData) => void
  showBoardCreationDialog: () => void
}

const useDialogStore = create<DialogState>()((set) => ({
  active: { state: 'none' },
  closeDialog: () => set({ active: { state: 'none' } }),
  showDeleteDialog: (data: DeleteDialogData) => set({ active: { state: 'delete', data } }),
  showBoardCreationDialog: () => set({ active: { state: 'createBoard' } }),
}))

export default useDialogStore
