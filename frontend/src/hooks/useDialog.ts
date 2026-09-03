import type { ColumnCreationDialogData } from "@/features/columns/ColumnCreationDialog"
import type { TaskCreationDialogData } from "@/features/tasks/TaskCreationsDialog"
import useBoardStore from "@/store/useBoardStore"
import useColumnStore from "@/store/useColumnStore"
import useDialogStore from "@/store/useDialogStore"
import useTaskStore from "@/store/useTaskStore"
import type { Board, Column, Task } from "@/types/models"

export default function useDialog() {
  const deleteBoard = useBoardStore(s => s.deleteBoard)
  const deleteColumn = useColumnStore(s => s.deleteColumn)
  const deleteTask = useTaskStore(s => s.deleteTask)
  const showDelete = useDialogStore(s => s.showDeleteDialog)
  const showBoardCreation = useDialogStore(s => s.showBoardCreationDialog)
  const showBoardEditing = useDialogStore(s => s.showBoardEditingDialog)
  const showColumnCreation = useDialogStore(s => s.showColumnCreationDialog)
  const showColumnEditing = useDialogStore(s => s.showColumnEditingDialog)
  const showTaskCreation = useDialogStore(s => s.showTaskCreationDialog)
  const showTaskEditing = useDialogStore(s => s.showTaskEditingDialog)

  return {
    promptCreateBoard: () => showBoardCreation(),
    promptEditBoard: (board: Board) => showBoardEditing(board),
    promptDeleteBoard: (board: Board) => {
      showDelete({
        name: board.name,
        description: "Deleting a board also deletes all columns and tasks inside it, are you sure you want to proceed?",
        onConfirm: () => deleteBoard(board.id)
      })
    },
    promptCreateColumn: (data:ColumnCreationDialogData) => showColumnCreation(data),
    promptEditColumn: (column: Column) => showColumnEditing(column),
    promptDeleteColumn: (column: Column) => {
      showDelete({
        name: column.name,
        description: "Deleting a column also deletes all tasks contained inside it. Are you sure you want to proceed?",
        onConfirm: () => deleteColumn(column.id)
      })
    },
    promptCreateTask: (data: TaskCreationDialogData) => showTaskCreation(data),
    promptEditTask: (task: Task) => showTaskEditing(task),
    promptDeleteTask: (task: Task) => {
      showDelete({
        name: task.name,
        onConfirm: () => deleteTask(task.id)
      })
    },
  }
}
