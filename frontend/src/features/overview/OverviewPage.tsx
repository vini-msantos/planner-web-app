import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import TaskCard from "../tasks/Task"
import useOverview from "@/hooks/useOverview"

export default function OverviewPage() {
  const {nextDue, promptDeleteTask, promptEditTask} = useOverview()
  
  return (
    <div className="w-full h-screen flex pt-20">
      {nextDue.length > 0 &&
        <section className="h-fit w-full">
          <h1 className="px-8 font-bold text-2xl tracking-wider">Next due:</h1>
          <ScrollArea className="h-fit w-full pb-4">
            <div className="flex flex-row items-strech px-6">
              {nextDue.map(t => (
                <TaskCard className="min-w-60 max-w-60 m-2" task={t} done={false}
                  promptDelete={() => promptDeleteTask(t)}
                  promptEdit={() => promptEditTask(t)}
                />
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
