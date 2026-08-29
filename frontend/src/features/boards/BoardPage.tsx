import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { Board, Column, Task } from "@/types/models";
import { EditIcon, GhostIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable"
import useBoard, { type UseBoardData } from "@/hooks/useBoard";
import { DragDropProvider } from "@dnd-kit/react"
import { move } from "@dnd-kit/helpers"
import { CollisionPriority } from "@dnd-kit/abstract"
import "./board_page.css"


export default function BoardPage() {
  const fetch = useBoard()

  return (
    <div className="flex flex-col h-screen w-full">
      {fetch.state == 'loading' && <Spinner className="w-10 h-10 m-auto"/>}
      {fetch.state == 'ok' &&
        <BoardDisplay
          board={fetch.board}
          columns={fetch.columns}
          columnOrder={fetch.columnOrder}
          tasks={fetch.tasks}
          taskOrder={fetch.taskOrder}
          promptCreateColumn={fetch.promptCreateColumn}
          promptDeleteColumn={fetch.promptDeleteColumn}
          updateLocal={fetch.updateLocal}
        />
    }
    </div>
  )
}

function BoardDisplay({board, columnOrder, columns, taskOrder, tasks, promptCreateColumn, promptDeleteColumn, updateLocal}: {
  board: Board,
  columns: Record<string, Column>,
  columnOrder: string[],
  tasks: Record<string, Task>,
  taskOrder: Record<string, string[]>,
  promptCreateColumn: () => void,
  promptDeleteColumn: (column: Column) => void,
  updateLocal: (func: (prevState: UseBoardData) => UseBoardData) => void,
}) {

  if (columnOrder.length > 0) return (
      <ScrollArea className="h-full mt-6 mb-2">
        <DragDropProvider
          onDragOver={(event) => {
            const {source} = event.operation;

            if (source?.type != 'task') return;

            updateLocal((s) => ({...s, taskOrder: move(taskOrder, event)}));
          }}
          onDragEnd={(event) => {
            const {source} = event.operation;

            if (event.canceled || source?.type != 'column') return;

            updateLocal((s) => ({...s, columnOrder: move(columnOrder, event)}));
          }}
        >
          <div className="flex flex-row w-full max-h-200 h-fit max-w-full pl-6 gap-x-6">
              {columnOrder.map((columnId, ci) => (
                <Column
                  key={columnId} index={ci} column={columns[columnId]}
                  promptDelete={() => promptDeleteColumn(columns[columnId])}
                >
                  {taskOrder[columnId].map((taskId, ti) => (
                    <TaskTile column={columnId} index={ti} key={taskId} task={tasks[taskId]} /> 
                  ))}
                </Column>
              ))}


            <div className="min-w-40 h-65 group/add-column -translate-x-3">
              <Button title="Add column" onClick={promptCreateColumn} variant="ghost" size='icon-lg' className="group-hover/add-column:opacity-100 group-hover/add-column:w-15 h-40 opacity-0 overflow-hidden w-0">
                <PlusIcon />
              </Button>
            </div>
          </div>

        </DragDropProvider>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
  )
  return <EmptyState board={board} promptCreateColumn={promptCreateColumn} />
}

function Column({ column, index, promptDelete, children }: { column: Column, index: number, promptDelete: VoidFunction, children: React.ReactNode }) {
  const { ref, handleRef } = useSortable({
    id: column.id, index, type: 'column', accept: ['column', 'task'], collisionPriority: CollisionPriority.Low,
  })

  return (
    <div ref={ref} className="min-w-65 w-65 h-fit group/column">
      <ContextMenu>
        <ContextMenuTrigger>
          <div ref={handleRef} className="bg-accent w-full h-fit p-4 pr-0 flex flex-col max-h-full rounded-t-xl border border-b-0 border-border">
            <div className=" flex flex-row justify-between">
              <h3 className="font-bold text-xl tracking-wide">
                {column.name}
              </h3>
            </ div>
            <p className="text-xs leading-tight text-muted-foreground pr-4">
              {column.description}
            </p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <EditIcon icon-data="inline"/> 
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={promptDelete} variant="destructive">
            <TrashIcon icon-data="inline"/> 
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <div className="group/list bg-card w-full h-fit rounded-b-xl border border-t-0 border-border">
        <Separator />
        <ScrollArea className="h-full max-h-140 p-3 overflow-scroll column-scroll-area">
          <div className="space-y-3">
            {children}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-3">
          <Button title="Add task" variant="ghost" size='lg' className="group-hover/column:opacity-100 group-hover/column:h-12 h-0 opacity-0 overflow-hidden w-full">
            <PlusIcon className="h-7 w-7" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TaskTile({task, index, column}: {task: Task, index: number, column: string}) {
  const { ref } = useSortable({id: task.id, index, type: "task", accept: "task", group: column})
  
  return (
    <div ref={ref} className="w-full h-20 bg-accent border border-border rounded-xl p-3">
      <h4>
        {task.name}
      </h4>
    </div>
  )
}

function EmptyState({board, promptCreateColumn}: {board: Board, promptCreateColumn: () => void}) {
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

