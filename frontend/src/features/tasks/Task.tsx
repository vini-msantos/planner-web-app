import { Badge } from "@/components/ui/badge"
import type { Task } from "@/types/models"
import { formatDistance } from "date-fns"
import { CalendarDaysIcon } from "lucide-react"

export default function TaskCard({ task, ref }: { task: Task, ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="w-full h-fit bg-secondary border border-border rounded-xl">
      {task.due_date &&
        <div className="p-1.5 bg-card border-b rounded-t-xl">
          
        <Badge variant="secondary" className="text-muted-foreground mb-1.5">
          <CalendarDaysIcon />
          Due {formatDistance(task.due_date, Date.now(), {addSuffix: true})}
        </Badge>
        </div>
      }
      <div className="p-3">
        <h4>
          {task.name}
        </h4>
      </div>
    </div>
  )
}
