import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import type { Board, Column, Task } from "@/types/models";
import { GhostIcon, PlusIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable"
import useBoard, { type UseBoard } from "@/hooks/useBoard";
import { PointerSensor } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react"
import { DndContext, pointerWithin } from "@dnd-kit/core"
import { move } from "@dnd-kit/helpers"
import { type DragEndEvent, type DragOverEvent } from "@dnd-kit/abstract"
import BoardColumn from "../columns/Column";
import TaskCard from "../tasks/Task";
import { useNavigate } from "react-router";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu";


export default function BoardPage() {
  const fetch = useBoard()
  const navigate = useNavigate()
  if (fetch.state == 'error') navigate("/boards")

  return (
    <div className="flex flex-col h-screen w-full">
      {fetch.state == 'loading' && <Spinner className="w-10 h-10 m-auto" />}
      {fetch.state == 'ok' && <BoardDisplay data={{ ...fetch }} />}
    </div>
  )
}

function BoardDisplay({ data }: { data: UseBoard }) {
  const { columnOrder, taskOrder, tasks, columns, board } = data
  if (columnOrder.length == 0) return (
    <EmptyState board={board} promptCreateColumn={data.promptCreateColumn} />
  )

  const sensors = [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({ value: 12 }),
      ],
    }),
  ]

  const handleDragOver = (event: DragOverEvent) => {
    const { source } = event.operation;
    if (source?.type != 'task') return;
    data.updateTasksLocally(move(taskOrder, event));
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { source } = event.operation;
    if (!source) return
    if (event.canceled) return data.revertLocalChanges()

    const id = source.id.toString()
    if (source?.type == 'column') data.moveColumn(id, move(columnOrder, event))
    else if (source?.type == 'task') data.moveTask(id, move(taskOrder, event))
  }

  return (
    <BoardContextMenu promptCreateColumn={data.promptCreateColumn}>
      <ScrollArea className="h-full mt-6 mb-2">
        <DndContext collisionDetection={pointerWithin}>
          <DragDropProvider
            sensors={sensors}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-row w-full max-h-200 h-fit max-w-full pl-6 gap-x-6">
              {columnOrder.map((columnId, ci) => (
                <BoardColumn
                  key={columnId}
                  index={ci}
                  column={columns[columnId]}
                  promptEdit={() => data.promptEditColumn(columns[columnId])}
                  promptDelete={() => data.promptDeleteColumn(columns[columnId])}
                  promptCreateTask={() => data.promptCreateTask(columns[columnId])}
                >
                  {data.taskOrder[columnId].map((taskId, ti) => (
                    <BoardTask
                      column={columns[columnId]}
                      index={ti}
                      key={taskId}
                      task={tasks[taskId]}
                      promptDelete={() => data.promptDeleteTask(tasks[taskId])}
                      promptEdit={() => data.promptEditTask(tasks[taskId])}
                    />
                  ))}
                </BoardColumn>
              ))}

              <div className="min-w-40 h-65 group/add-column -translate-x-3">
                <Button title="Add column" onClick={data.promptCreateColumn} variant="ghost" size='icon-lg' className="group-hover/add-column:opacity-100 group-hover/add-column:w-15 h-40 opacity-0 overflow-hidden w-0">
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </DragDropProvider>
        </DndContext>

        <ScrollBar orientation="horizontal" />
      </ScrollArea >
    </BoardContextMenu>
  )
}

function BoardContextMenu({ promptCreateColumn, children }: { promptCreateColumn: VoidFunction, children: React.ReactElement }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={children}>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Board</ContextMenuLabel>
          <ContextMenuItem onClick={promptCreateColumn}>
            <PlusIcon icon-data='inline' />
            Add column
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function EmptyState({ board, promptCreateColumn }: { board: Board, promptCreateColumn: () => void }) {
  return (
    <Empty className="bg-muted/30 rounded-none">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GhostIcon />
        </EmptyMedia>
        <EmptyTitle>
          Looks like '{board.name}' is empty...
        </EmptyTitle>
        <EmptyDescription>
          Start organizing your workflow by creating a column to store your tasks.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button onClick={promptCreateColumn}>
          <PlusIcon data-icon="inline-start" />
          Create column
        </Button>
      </EmptyContent>
    </Empty>
  )
}

function BoardTask({ task, index, column, promptDelete, promptEdit }: {
  task: Task,
  index: number,
  column: Column
  promptEdit: VoidFunction,
  promptDelete: VoidFunction,
}) {
  const { ref } = useSortable({ id: task.id, index, type: "task", accept: "task", group: column.id })
  return <TaskCard done={column.completes_tasks} task={task} ref={ref} promptDelete={promptDelete} promptEdit={promptEdit} />
}
