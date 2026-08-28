import { useSidebar } from "@/components/ui/sidebar"
import useBoardStore from "@/store/useBoardStore"
import useDialogStore from "@/store/useDialogStore"
import { useState } from "react"

export default function useAppSidebar() {
  const { open } = useSidebar()
  const [boardsVisible, setBoardsVisible] = useState(true)
  const { error, boards, patchBoard, deleteBoard } = useBoardStore()
  const showBoardCreationDialog = useDialogStore(s => s.showBoardCreationDialog)

  return {
    error,
    open,
    boardsVisible,
    setBoardsVisible,
    boards,
    showBoardCreationDialog,
    deleteBoard,
    toggleBoardPin: async (id: string) => {
      return await patchBoard(id, { pinned: boards[id].pinned == undefined })
    },
  }
}
