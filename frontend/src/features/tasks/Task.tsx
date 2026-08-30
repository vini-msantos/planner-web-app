import { Badge } from "@/components/ui/badge"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu"
import type { Task } from "@/types/models"
import { formatDistance } from "date-fns"
import { CalendarDaysIcon, CheckIcon, PencilIcon, TextIcon, TrashIcon } from "lucide-react"

export default function TaskCard({ task, ref, done, ...dialog }: {
  task: Task,
  ref?: React.Ref<HTMLDivElement>
  done: boolean,
  promptDelete: VoidFunction,
  promptEdit: VoidFunction,
}) {
  return (
    <TaskContextMenu promptDelete={dialog.promptDelete} promptEdit={dialog.promptEdit}>
      <div ref={ref} className="w-full h-fit bg-secondary border border-border rounded-xl">
        <div className={`p-3 leading-tight text-sm ${done ? "text-muted-foreground line-through" : ""}`}>
          <h4>
            {task.name}
          </h4>
        </div>
        {(task.due_date || task.description.length > 0 || done) &&
          <div className="p-1.5 space-x-1.5 bg-card border-b rounded-b-xl flex flex-row">
            {done &&
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                <CheckIcon />
                Done
              </Badge>
            }
            {task.description.length > 0 &&
              <Badge variant="secondary">
                <TextIcon className="stroke-muted-foreground" />
              </Badge>
            }
            {task.due_date && !done &&
              <Badge variant="secondary" className="text-muted-foreground">
                <CalendarDaysIcon />
                Due {formatDistance(task.due_date, Date.now(), { addSuffix: true })}
              </Badge>
            }
          </div>
        }
      </div>
    </TaskContextMenu>
  )
}

function TaskContextMenu({ promptDelete, promptEdit, children }: {
  promptDelete: VoidFunction,
  promptEdit: VoidFunction,
  children: React.ReactElement,
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={children} />
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Task</ContextMenuLabel>
          <ContextMenuItem onClick={promptEdit}>
            <PencilIcon icon-data="inline" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={promptDelete}>
            <TrashIcon icon-data="inline" />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
