import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import TaskCard from "../tasks/Task"
import useOverview from "@/hooks/useOverview"
import BoardCard from "../boards/BoardCard"

export default function OverviewPage() {
  const {pinnedBoards, nextDue} = useOverview()
  
  return (
    <div className="w-full h-screen flex flex-col space-y-4 pt-20">
      {nextDue.length > 0 &&
        <ListSection title="Next due:">
          {nextDue.map(t => (
            <TaskCard key={t.id} className="min-w-60 max-w-60 m-2" task={t} />
          ))}
        </ListSection>
      }
      {pinnedBoards.length > 0 &&
        <ListSection title="Pinned boards:">
          {pinnedBoards.map(b => (
            <BoardCard
              key={b.id}
              className="min-w-60 max-w-60 grow m-2"
              board={b}
            />
          ))}
        </ListSection>
      }
    </div>
  )
}

function ListSection({title, children}: {title: string, children: React.ReactNode}) {
  return (
    <section className="h-fit w-full">
      <h1 className="px-8 font-bold text-2xl tracking-wider">{title}</h1>
      <ScrollArea className="h-fit w-full pb-4">
        <div className="flex flex-row items-strech px-6">
          {children}
          <div className="min-w-6"/>
        </div>

        <ScrollBar hidden={true} orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}
