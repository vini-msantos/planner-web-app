import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Column } from "@/types/models"
import { useSortable } from "@dnd-kit/react/sortable"
import { EditIcon, TrashIcon, PlusIcon } from "lucide-react"
import "./column.css"

export default function BoardColumn({ column, index, promptCreateTask, promptDelete, children }: {
  column: Column, index: number, promptDelete: VoidFunction, promptCreateTask: VoidFunction, children: React.ReactNode
}) {
  const { ref, handleRef } = useSortable({
    id: column.id, index, type: 'column', accept: ['column', 'task']
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
            <EditIcon icon-data="inline" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={promptDelete} variant="destructive">
            <TrashIcon icon-data="inline" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <div className="group/list bg-card w-full h-fit rounded-b-xl border border-t-0 border-border">
        <Separator />
        <ScrollArea className="h-full max-h-140 p-3 overflow-scroll column-scroll-area">
          <div className="space-y-3 min-h-6">
            {children}
          </div>
        </ScrollArea>
        <div className="grid grid-rows-[0fr] grid-cols-1 group-hover/column:grid-rows-[1fr] transition-all">
          <div className="min-h-0 overflow-hidden">
            <Separator />
            <div className="p-3">
              <Button onClick={promptCreateTask} title="Add task" variant="ghost" size='lg' className="group-hover/column:opacity-100 opacity-0 overflow-hidden w-full">
                <PlusIcon className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

