import useBoardStore from "@/store/useBoardStore"
import useColumnStore from "@/store/useColumnStore"
import useDialogStore from "@/store/useDialogStore"
import useTaskStore from "@/store/useTaskStore"
import type { Task } from "@/types/models"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { useShallow } from "zustand/shallow"

export default function useTaskSheet() {
  const [params, setParams] = useSearchParams()
  const [task, setTask] = useState<Task>()
  const allColumns = useColumnStore(s => s.columns)
  const allBoards = useBoardStore(s => s.boards)
  const { tasks: allTasks, deleteTask } = useTaskStore(useShallow(s => ({tasks: s.tasks, deleteTask: s.deleteTask})))
  const { showDeleteDialog, showTaskEditingDialog } = useDialogStore(useShallow(s => ({showDeleteDialog: s.showDeleteDialog, showTaskEditingDialog: s.showTaskEditingDialog})))

  useEffect(() => {
    const id = params.get("task")
    if (!id) return
    
    setTask(allTasks[id])
  }, [params, allTasks, allColumns, allBoards])

  if (!task) return ({
    status: 'error',
    closeSheet: () => setParams(),

    sheetOpen: false,
  } as const)

  const column = allColumns[task.column_id]
  const taskDone = column.completes_tasks
  const board = allBoards[column.board_id]

  return {
    status: 'ok',
    closeSheet: () => setParams(),
    sheetOpen: params.get("task") != null && task != undefined,
    task,
    promptDelete: () => {
      showDeleteDialog({
        name: task.name,
        onConfirm: () => deleteTask(task.id)
      })
    },
    promptEdit: () => showTaskEditingDialog(task),
    taskDone,
    board,
  }
}
