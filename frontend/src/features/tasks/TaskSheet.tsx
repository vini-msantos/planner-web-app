import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DoneBadge, DueDateBadge } from "./Task"
import { Separator } from "@/components/ui/separator"
import { PencilIcon, TrashIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import useTaskSheet from "@/hooks/useTaskSheet"
import { Link } from "react-router"
import Markdown from "react-markdown"


export default function TaskSheet() {
  const data = useTaskSheet()

  return (
    <Sheet
      open={data.sheetOpen}
      onOpenChange={(open) => !open && data.closeSheet()}
    >
      <SheetContent showCloseButton={false}>
        {data.status == 'ok' && <>
          <SheetHeader className="space-y-2">
            <div className="flex flex-row space-x-1 items-center justify-end">
              <p className="flex grow text-muted-foreground"> 
                <Link title={`Go to board '${data.board.name}'`} to={`/boards/${data.board.id}`} >
                  Task in <span className="underline">{data.board.name}</span>
                </Link>
              </p>

              <Button
                variant="ghost" size="icon" title="Edit task"
                onClick={data.promptEdit}
              >
                <PencilIcon className="stroke-muted-foreground"/>
              </Button>

              <Button
                variant="ghost" size="icon" title="Delete task"
                onClick={data.promptDelete}
              >
                <TrashIcon className="stroke-destructive"/>
              </Button>

              <Button
                variant="ghost" size="icon" title="Close view"
                onClick={data.closeSheet}
              >
                <XIcon className="stroke-muted-foreground"/>
              </Button>
            </div>

            <SheetTitle className="font-bold text-xl">
              {data.task.name}
            </SheetTitle>

            {(data.task.due_date || data.taskDone) &&
              <div className="flex flex-row space-x-2">
                { data.taskDone && <DoneBadge /> }
                { data.task.due_date && <DueDateBadge dueDate={data.task.due_date} /> }
              </div>
            }

            <Separator className="mt-2 mb-4"/>

            <SheetDescription className="whitespace-break-spaces markdown">
              <Markdown>
                {data.task.description}
              </Markdown>
            </SheetDescription>
          </SheetHeader>
        </>}
      </SheetContent>
    </Sheet>
  )
}
