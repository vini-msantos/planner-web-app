import useColumnStore from "@/store/useColumnStore"
import useDialogStore from "@/store/useDialogStore"
import useTaskStore from "@/store/useTaskStore"
import type { Task } from "@/types/models"
import { compareAsc } from "date-fns"
import { useShallow } from "zustand/shallow"

export default function useOverview() {
  const { tasks, deleteTask } = useTaskStore()
  const { showDeleteDialog, showTaskEditingDialog } = useDialogStore(
    useShallow(s => ({showDeleteDialog: s.showDeleteDialog, showTaskEditingDialog: s.showTaskEditingDialog}))
  )
  const columns = useColumnStore(s => s.columns)

  const nextDue = Object.entries(tasks)
    .map(([_, t]) => t)
    .filter(t => t.due_date != undefined && !columns[t.column_id].completes_tasks)
    .toSorted((t1, t2) => compareAsc(t1.due_date!, t2.due_date!)*10 + t1.name.localeCompare(t2.name))
  

  return {
    nextDue,
    promptDeleteTask: (task: Task) => {
      showDeleteDialog({
        name: task.name,
        onConfirm: () => deleteTask(task.id),
      })
    },
    promptEditTask: (task: Task) => showTaskEditingDialog(task),
  }
}
