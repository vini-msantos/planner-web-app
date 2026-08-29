import { useSidebar } from "@/components/ui/sidebar"
import useBoardStore from "@/store/useBoardStore"
import useDialogStore from "@/store/useDialogStore"
import type { Board } from "@/types/models"
import { useState } from "react"
import { useShallow } from "zustand/shallow"

export default function useAppSidebar() {
  const { open } = useSidebar()
  const [boardsVisible, setBoardsVisible] = useState(true)
  const { error, boards, patchBoard, deleteBoard } = useBoardStore()
  const { showBoardCreationDialog, showBoardEditingDialog, showDeleteDialog }  = useDialogStore(
    useShallow((s) => ({
      showBoardCreationDialog: s.showBoardCreationDialog,
      showBoardEditingDialog: s.showBoardEditingDialog,
      showDeleteDialog: s.showDeleteDialog
    })),
  )

  return {
    error,
    open,
    boardsVisible,
    setBoardsVisible,
    boards,
    promptCreateBoard: () => showBoardCreationDialog(),
    promptEditBoard: (board: Board) => showBoardEditingDialog(board),
    promptDeleteBoard: (board: Board) => {
      showDeleteDialog({
        name: board.name,
        description: "Deleting a board also deletes all columns and tasks inside it, are you sure you want to proceed?",
        onConfirm: () => deleteBoard(board.id)
      })
    },
    toggleBoardPin: async (id: string) => {
      return await patchBoard(id, { pinned: boards[id].pinned == undefined })
    },
  }
}
