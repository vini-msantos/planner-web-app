import { getRequest } from "@/api";
import useBoardStore from "@/store/useBoardStore";
import useColumnStore from "@/store/useColumnStore";
import useDialogStore from "@/store/useDialogStore";
import useTaskStore from "@/store/useTaskStore";
import type { BoardDto } from "@/types/dtos";
import type { Board, Column, Task } from "@/types/models";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useShallow } from "zustand/shallow";

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

type UseBoard = {
  promptDeleteColumn: (column: Column) => void
  promptCreateColumn: () => void,
  updateLocal: (func: (prevState: UseBoardData) => UseBoardData) => void
} & UseBoardData

export default function useBoard(): State {
  const { id } = useParams()

  const [boardData, setBoard] = useState<UseBoardData | 'error' | 'loading'>('loading')
  const lastSync = useRef(boardData)

  const { showColumnCreationDialog, showDeleteDialog } = useDialogStore(
    useShallow(s => ({
      showDeleteDialog: s.showDeleteDialog,
      showColumnCreationDialog: s.showColumnCreationDialog
    }))
  )

  const allBoards = useBoardStore(s => s.boards)
  const { columns: allColumns, deleteColumn } = useColumnStore(
    useShallow(s => ({ columns: s.columns, deleteColumn: s.deleteColumn }))
  )
  const { tasks: allTasks, deleteTask } = useTaskStore(
    useShallow(s => ({ tasks: s.tasks, deleteTask: s.deleteTask }))
  )
  const fetchBoard = async () => {
    const result = await getRequest<BoardDto>(`boards/${id}`)
    if (result == 'error') return setBoard('error')

    let taskMap = new Map<string, Task[]>(
      Object.entries({...result.columns, ...result.routed_columns})
      .map(([id, _]) => [id, []])
    )

    const columnOrder = Object.entries(result.columns).map(([_, c]) => c)
      .sort((a, b) => a.position - b.position)
      .map(c => c.id)

    for (const [_, task] of Object.entries(allTasks)) {
      taskMap.get(task.column_id)!.push(task)
    }

    taskMap.forEach((ts, _) => ts.sort((a, b) => a.position - b.position))
    setBoard({
      board: result.board,
      columns: result.columns,
      tasks: result.tasks,
      taskOrder: Object.fromEntries([...taskMap.entries()]
        .map(([columnId, tasks]) => [columnId, tasks.map(task => task.id)])),
      columnOrder,
    })
    lastSync.current = boardData
  }

  useEffect(() => {
    fetchBoard()
  }, [id, allBoards, allColumns, allTasks])

  if (boardData == 'loading') return { state: 'loading' }
  if (boardData == 'error') return { state: 'error' }


  return {
    state: 'ok',
    ...boardData,
    promptDeleteColumn: (column: Column) => {
      showDeleteDialog({
        name: column.name,
        description: "Deleting a column also deletes all tasks contained inside it. Are you sure you want to proceed?",
        onConfirm: () => deleteColumn(column.id)
      })
    },
    promptCreateColumn: () => {
      const position = Object.entries(boardData.columns)
        .map(([_, t]) => t.position)
        .reduce((p1, p2) => Math.max(p1, p2), 0) + 1000
      showColumnCreationDialog({ position, board: boardData.board, onCreate: () => fetchBoard() })
    },
    updateLocal: (func) => {
      setBoard(func(boardData))
    },
  }
}
