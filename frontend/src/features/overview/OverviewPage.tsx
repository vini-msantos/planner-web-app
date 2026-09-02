import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import TaskCard from "../tasks/Task"
import useOverview from "@/hooks/useOverview"
import type { Board } from "@/types/models"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { CheckSquareIcon, ClipboardListIcon, TextIcon } from "lucide-react"
import { BoardContextMenu } from "@/components/layout/Sidebar"
import { Progress } from "@/components/ui/progress"

export default function OverviewPage() {
  const {pinnedBoards, nextDue, ...action} = useOverview()
  
  return (
    <div className="w-full h-screen flex flex-col space-y-4 pt-20">
      {nextDue.length > 0 &&
        <section className="h-fit w-full">
          <h1 className="px-8 font-bold text-2xl tracking-wider">Next due:</h1>
          <ScrollArea className="h-fit w-full pb-4">
            <div className="flex flex-row items-strech px-6">
              {nextDue.map(t => (
                <TaskCard className="min-w-60 max-w-60 m-2" task={t} done={false}
                  promptDelete={() => action.promptDeleteTask(t)}
                  promptEdit={() => action.promptEditTask(t)}
                />
              ))}
              <div className="min-w-6"/>
            </div>

            <ScrollBar hidden={true} orientation="horizontal" />
          </ScrollArea>
        </section>
      }
      {nextDue.length > 0 &&
        <section className="h-fit w-full">
          <h1 className="px-8 font-bold text-2xl tracking-wider">Pinned boards:</h1>
          <ScrollArea className="h-fit w-full pb-4">
            <div className="flex flex-row items-strech px-6">
              {pinnedBoards.map(b => (
                <BoardCard
                  key={b.id}
                  className="min-w-60 max-w-60 grow m-2"
                  promptEdit={() => action.promptEditBoard(b)}
                  promptDelete={() => action.promptDeleteBoard(b)}
                  togglePin={() => action.togglePin(b)}
                  board={b}
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

type BoardCardData = Board & {
  taskCount: number,
  completedTaskCount: number,
  hasCompletionColumn: boolean,
}

function BoardCard({board, showDescription = false, className = "", ...dialog}: {
  board: BoardCardData,
  showDescription?: boolean,
  className?: string,
  togglePin: VoidFunction,
  promptDelete: VoidFunction,
  promptEdit: VoidFunction,
}) {
  const completion = 100 - (board.taskCount - board.completedTaskCount) / board.taskCount * 100

  return (
    <BoardContextMenu togglePin={dialog.togglePin} isPinned={true} promptDelete={dialog.promptDelete} promptEdit={dialog.promptEdit}>
      <Link to={`/boards/${board.id}`} className="flex h-full">
        <div
          title="Open board"
          className={`hover:cursor-pointer w-full flex flex-col bg-secondary border border-border rounded-xl ${className}`}
        >
          <div className="p-3 flex flex-col grow gap-y-1" >
            <h4 className="leading-tight text-base font-semibold">
              {board.name}
            </h4>
            {showDescription && <p className="text-xs text-muted-foreground leading-tight">{board.description}</p>}
          </div>
          <div className="p-1.5 space-x-1.5 bg-card border-b rounded-b-xl items-center flex flex-row">
            {!showDescription && board.description.length > 0 &&
              <Badge variant="secondary" title="This card has a description">
                <TextIcon className="stroke-muted-foreground" />
              </Badge>
            }
            <Badge variant="secondary" title="Number of pending tasks" className="text-muted-foreground">
              <ClipboardListIcon className="stroke-muted-foreground"/>
              {board.taskCount - board.completedTaskCount}
            </Badge>
            {board.hasCompletionColumn && <>
              <Badge title="Number of completed tasks" variant="secondary" className="text-muted-foreground">
                <CheckSquareIcon className="stroke-muted-foreground"/>
                {board.completedTaskCount}
              </Badge> 
              <Progress value={completion} className="grow" />
              <span className="text-muted-foreground text-xs">{Math.ceil(completion)}%</span> </>
            }
          </div>
        </div>
      </Link>
    </BoardContextMenu>
  )
}


