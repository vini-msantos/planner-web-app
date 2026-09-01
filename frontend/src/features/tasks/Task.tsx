import { Badge } from "@/components/ui/badge"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu"
import type { Task } from "@/types/models"
import { formatDate, formatDistance } from "date-fns"
import { CalendarDaysIcon, CheckIcon, PencilIcon, TextIcon, TrashIcon } from "lucide-react"
import { useSearchParams } from "react-router"

export function DoneBadge() {
  return (
    <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 select-none">
      <CheckIcon />
      Done
    </Badge>
  )
}

export function DueDateBadge({dueDate}: {dueDate: Date}) {
  return (
    <Badge title={formatDate(dueDate, "PPPP")} variant="secondary" className="text-muted-foreground select-none">
      <CalendarDaysIcon />
      Due {formatDistance(dueDate, Date.now(), { addSuffix: true })}
    </Badge>
  )
}

export default function TaskCard({ className = "", task, ref, done, ...dialog }: {
  className?: string
  task: Task,
  ref?: React.Ref<HTMLDivElement>
  done: boolean,
  promptDelete: VoidFunction,
  promptEdit: VoidFunction,
}) {
  const [_, setParams] = useSearchParams()

  return (
    <TaskContextMenu promptDelete={dialog.promptDelete} promptEdit={dialog.promptEdit}>
      <div
        onClick={() => setParams({task: task.id})}
        ref={ref}
        title="View task"
        className={`hover:cursor-pointer w-full flex flex-col bg-secondary border border-border rounded-xl ${className}`}
      >
        <div className={`p-3 flex grow leading-tight text-sm ${done ? "text-muted-foreground line-through" : ""}`}>
          <h4>
            {task.name}
          </h4>
        </div>
        {(task.due_date || task.description.length > 0 || done) &&
          <div className="p-1.5 space-x-1.5 bg-card border-b rounded-b-xl flex flex-row">
            { done && <DoneBadge /> }
            {task.description.length > 0 &&
              <Badge variant="secondary">
                <TextIcon className="stroke-muted-foreground" />
              </Badge>
            }
            { task.due_date && !done && <DueDateBadge dueDate={task.due_date} /> }
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
