import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import useColumnStore from "@/store/useColumnStore"
import useTaskStore from "@/store/useTaskStore"
import { compareAsc } from "date-fns"
import TaskCard from "../tasks/Task"

export default function OverviewPage() {
  const tasks = useTaskStore(s => s.tasks)
  const columns = useColumnStore(s => s.columns)

  const nextDue = Object.entries(tasks)
    .map(([_, t]) => t)
    .filter(t => t.due_date != undefined && !columns[t.column_id].completes_tasks)
    .toSorted((t1, t2) => compareAsc(t1.due_date!, t2.due_date!)*10 + t1.name.localeCompare(t2.name))
  
  return (
    <div className="w-full h-screen flex pt-20">
      {nextDue.length > 0 &&
        <section className="h-fit w-full">
          <h1 className="px-8 font-bold text-2xl tracking-wider">Next due:</h1>
          <ScrollArea className="h-fit w-full pb-4">
            <div className="flex flex-row items-strech px-6">
              {nextDue.map(t => (
                <TaskCard className="min-w-60 max-w-60 m-2" task={t} done={false} promptDelete={() => {}} promptEdit={() => {}}/>
              ))}
              <div className="min-w-6"/>
            </div>

            <ScrollBar hidden={true} orientation="horizontal" />
          </ScrollArea>
        </section>
      }
    </div>
  )
}
