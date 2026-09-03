import useBoardStore from "@/store/useBoardStore"
import useColumnStore from "@/store/useColumnStore"
import useDialogStore from "@/store/useDialogStore"
import useTaskStore from "@/store/useTaskStore"
import type { Board, Task } from "@/types/models"
import { compareAsc } from "date-fns"
import { useShallow } from "zustand/shallow"

export default function useOverview() {
  const { tasks, deleteTask } = useTaskStore()
  const { boards, deleteBoard, patchBoard } = useBoardStore()
  const { showDeleteDialog, showTaskEditingDialog, showBoardEditingDialog } = useDialogStore(
    useShallow(s => ({showDeleteDialog: s.showDeleteDialog, showTaskEditingDialog: s.showTaskEditingDialog, showBoardEditingDialog: s.showBoardEditingDialog}))
  )
  const columns = useColumnStore(s => s.columns)

  const nextDue = Object.entries(tasks)
    .map(([_, t]) => t)
    .filter(t => t.due_date != undefined && !columns[t.column_id].completes_tasks)
    .toSorted((t1, t2) => compareAsc(t1.due_date!, t2.due_date!)*10 + t1.name.localeCompare(t2.name))

  const pinnedBoards = Object.fromEntries(
    Object.entries(boards)
      .map(([id, b]) => [id, {...b, completedTaskCount: 0, taskCount: 0, hasCompletionColumn: false}])
  )

  Object.entries(tasks).forEach(t => {
    const column = columns[t[1].column_id]
    const board = boards[column.board_id]
    if (!board.pinned) return
    if (column.completes_tasks) pinnedBoards[board.id].completedTaskCount++
    pinnedBoards[board.id].taskCount++
  })

  Object.entries(columns).forEach(([_, c]) => {
    const board = boards[c.board_id]
    if (c.completes_tasks && board.pinned) pinnedBoards[board.id].hasCompletionColumn = true
  })

  return {
    nextDue,
    pinnedBoards: Object.entries(pinnedBoards)
      .map(([_, b]) => b)
      .filter(b => b.pinned != null)
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    promptDeleteTask: (task: Task) => {
      showDeleteDialog({
        name: task.name,
        onConfirm: () => deleteTask(task.id),
      })
    },
    togglePin: (board: Board) => patchBoard(board.id, {pinned: board.pinned == null}),
    promptEditBoard: (board: Board) => showBoardEditingDialog(board),
    promptDeleteBoard: (board: Board) => {
      showDeleteDialog({
        name: board.name,
        onConfirm: () => deleteBoard(board.id),
      })
    },
    promptEditTask: (task: Task) => showTaskEditingDialog(task),
  }
}
