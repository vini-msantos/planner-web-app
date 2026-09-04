import { Badge } from "@/components/ui/badge"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu"
import useDialog from "@/hooks/useDialog"
import useColumnStore from "@/store/useColumnStore"
import type { Task } from "@/types/models"
import { formatDate, formatDistance, isSameDay } from "date-fns"
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
  const date = new Date(dueDate)
  const text = isSameDay(new Date(), date)
    ? `Due today at ${date.toLocaleTimeString(undefined, {timeStyle: 'short'})}`
    : `Due ${formatDistance(date, Date.now(), { addSuffix: true })}`
  return (
    <Badge title={formatDate(date, "PPPPp")} variant="secondary" className="text-muted-foreground select-none">
      <CalendarDaysIcon />
      {text}
    </Badge>
  )
}

export default function TaskCard({ className = "", task, ref }: {
  className?: string
  task: Task,
  ref?: React.Ref<HTMLDivElement>
}) {
  const [_, setParams] = useSearchParams()
  const done = useColumnStore(s => s.columns[task.column_id]?.completes_tasks)

  return (
    <TaskContextMenu task={task}>
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
              <Badge variant="secondary" title="This card has a description">
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

function TaskContextMenu({ task, children }: { task: Task, children: React.ReactElement }) {
  const { promptEditTask, promptDeleteTask } = useDialog()
  return (
    <ContextMenu>
      <ContextMenuTrigger render={children} />
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Task</ContextMenuLabel>
          <ContextMenuItem onClick={() => promptEditTask(task)}>
            <PencilIcon icon-data="inline" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={() => promptDeleteTask(task)}>
            <TrashIcon icon-data="inline" />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
