import { Badge } from "@/components/ui/badge"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Progress } from "@/components/ui/progress"
import useDialog from "@/hooks/useDialog"
import useBoardStore from "@/store/useBoardStore"
import type { Board } from "@/types/models"
import { TextIcon, ClipboardListIcon, CheckSquareIcon, PencilIcon, PinOffIcon, PinIcon, TrashIcon } from "lucide-react"
import { Link } from "react-router"

type BoardCardData = Board & {
  taskCount: number,
  completedTaskCount: number,
  hasCompletionColumn: boolean,
}

export default function BoardCard({board, showDescription = false, className = ""}: {
  board: BoardCardData,
  showDescription?: boolean,
  className?: string,
}) {
  const completion = 100 - (board.taskCount - board.completedTaskCount) / board.taskCount * 100

  return (
    <BoardContextMenu boardId={board.id}>
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

export function BoardContextMenu({children, boardId}: {
  boardId: string
  children: React.ReactElement[] | React.ReactElement,
}) {
  const board = useBoardStore(s => s.boards[boardId])
  const isPinned = board.pinned != null
  const togglePin = useBoardStore(s => s.toggleBoardPin)
  const { promptDeleteBoard, promptEditBoard } = useDialog()

  return (
    <ContextMenu>
      <ContextMenuTrigger>
       {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Board</ContextMenuLabel>
          <ContextMenuItem onClick={() => promptEditBoard(board)}>
            <PencilIcon />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={() => togglePin(board.id)}>
            {isPinned ? <PinOffIcon /> : <PinIcon  />}
            {isPinned ? "Unpin board" : "Pin board"}
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" className="w-full" onClick={() => promptDeleteBoard(board)}>
            <TrashIcon />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
