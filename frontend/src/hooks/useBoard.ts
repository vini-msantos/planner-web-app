import { getRequest } from "@/api";
import useBoardStore from "@/store/useBoardStore";
import useColumnStore from "@/store/useColumnStore";
import useTaskStore from "@/store/useTaskStore";
import type { BoardDto } from "@/types/dtos";
import type { Board, Column, Task } from "@/types/models";
import { calculateNewPosition } from "@/utils/position";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useShallow } from "zustand/shallow";
import useDialog from "./useDialog";

type State =
  | { state: 'error' }
  | { state: 'loading' }
  | { state: 'ok' } & UseBoard

export type UseBoardData = {
  board: Board,
  tasks: Record<string, Task>
  taskOrder: Record<string, string[]>
  columns: Record<string, Column>
  columnOrder: string[],
}

export type UseBoard = {
  promptDeleteColumn: (column: Column) => void
  promptCreateColumn: () => void,
  promptEditColumn: (column: Column) => void,
  promptDeleteTask: (task: Task) => void
  promptEditTask: (task: Task) => void
  promptCreateTask: (column: Column) => void
  updateTasksLocally: (taskOrder: Record<string, string[]>) => void
  revertLocalChanges: () => void
  moveColumn: (moved: string, newOrder: string[]) => void
  moveTask: (moved: string, newOrder: Record<string, string[]>) => void
} & UseBoardData

export default function useBoard(): State {
  const { id } = useParams()

  const [boardData, setBoard] = useState<UseBoardData | 'error' | 'loading'>('loading')
  const lastSync = useRef<Record<string, string[]>>(undefined)
  const dialog = useDialog()

  const allBoards = useBoardStore(s => s.boards)
  const { columns: allColumns, patchColumn } = useColumnStore(
    useShallow(s => ({ columns: s.columns, deleteColumn: s.deleteColumn, patchColumn: s.patchColumn }))
  )
  const { tasks: allTasks, patchTask } = useTaskStore(
    useShallow(s => ({ tasks: s.tasks, deleteTask: s.deleteTask, patchTask: s.patchTask }))
  )
  const fetchBoard = async () => {
    const result = await getRequest<BoardDto>(`boards/${id}`)
    if (result == 'error') return setBoard('error')

    let taskMap = new Map<string, Task[]>(
      Object.entries(result.columns)
        .map(([id, _]) => [id, []])
    )

    const columnOrder = Object.entries(result.columns).map(([_, c]) => c)
      .sort((a, b) => a.position - b.position)
      .map(c => c.id)

    for (const [_, task] of Object.entries(result.tasks)) {
      taskMap.get(task.column_id)!.push(task)
    }

    taskMap.forEach((ts, _) => ts.sort((a, b) => a.position - b.position))

    const taskOrder = Object.fromEntries([...taskMap.entries()]
      .map(([columnId, tasks]) => [columnId, tasks.map(task => task.id)]))

    setBoard({
      board: result.board,
      columns: result.columns,
      tasks: result.tasks,
      taskOrder,
      columnOrder,
    })
    lastSync.current = taskOrder
  }

  useEffect(() => {
    fetchBoard()
  }, [id, allBoards, allColumns, allTasks])

  if (boardData == 'loading') return { state: 'loading' }
  if (boardData == 'error') return { state: 'error' }


  return {
    state: 'ok',
    ...boardData,
    promptDeleteColumn: dialog.promptDeleteColumn,
    promptDeleteTask: dialog.promptDeleteTask,
    promptCreateColumn: () => {
      const position = Object.entries(boardData.columns)
        .map(([_, t]) => t.position)
        .reduce((p1, p2) => Math.max(p1, p2), 0) + 1000
      dialog.promptCreateColumn({ position, board: boardData.board })
    },
    promptCreateTask: (column: Column) => {
      const position = Object.entries(boardData.tasks)
        .filter(([_, t]) => t.column_id == column.id)
        .map(([_, t]) => t.position)
        .reduce((p1, p2) => Math.max(p1, p2), 0) + 1000
      dialog.promptCreateTask({ position, column })
    },
    promptEditColumn: dialog.promptEditColumn,
    promptEditTask: dialog.promptEditTask,
    updateTasksLocally: (taskOrder) => setBoard({ ...boardData, taskOrder }),
    revertLocalChanges: () => setBoard({ ...boardData, taskOrder: lastSync.current! }),
    moveColumn: (moved, newOrder) => {
      const newIndex = newOrder.findIndex(cId => cId == moved)
      const prev = newIndex == 0 ? undefined : newOrder.at(newIndex - 1)
      const next = newOrder.at(newIndex + 1)

      const position = calculateNewPosition(
        prev ? allColumns[prev].position : undefined,
        next ? allColumns[next].position : undefined
      )
      patchColumn(moved, { position })
    },
    moveTask: (moved, newOrder) => {
      const cId = Object.entries(newOrder).find(([_cId, tasks]) => tasks.includes(moved))?.[0]!
      const newIndex = newOrder[cId].findIndex(cId => cId == moved)
      const prev = newIndex == 0 ? undefined : newOrder[cId].at(newIndex - 1)
      const next = newOrder[cId].at(newIndex + 1)

      const position = calculateNewPosition(
        prev ? allTasks[prev].position : undefined,
        next ? allTasks[next].position : undefined
      )
      patchTask(moved, { column_id: cId, position, update_due_date: false })
    }
  }
}
