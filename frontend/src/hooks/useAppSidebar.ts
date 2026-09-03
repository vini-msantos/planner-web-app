import { useSidebar } from "@/components/ui/sidebar"
import useBoardStore from "@/store/useBoardStore"
import { useState } from "react"

export default function useAppSidebar() {
  const { open } = useSidebar()
  const [boardsVisible, setBoardsVisible] = useState(true)
  const { error, boards: boardStore } = useBoardStore()

  const boards = Object.entries(boardStore).map(([_, b]) => b)
    .sort((a, b) => {
      const aPin = a.pinned ? new Date(a.pinned).getTime() : 0
      const bPin = b.pinned ? new Date(b.pinned).getTime() : 0
      if (bPin - aPin != 0) return bPin - aPin
      return a.name.localeCompare(b.name)
    })

  return {
    error,
    open,
    boardsVisible,
    setBoardsVisible,
    boards,
  }
}
