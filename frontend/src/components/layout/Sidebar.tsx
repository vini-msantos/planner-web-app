import { type ReactNode } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "../ui/sidebar"
import { CalendarDays, CheckSquare, ChevronDown, Columns3, Home, PencilIcon, Pin, Plus, TrashIcon } from "lucide-react"
import { NavLink } from "react-router"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import useAppSidebar from "@/hooks/useAppSidebar"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "../ui/context-menu"
import type { Board } from "@/types/models"

export default function AppSidebar() {
  const { open, boards, boardsVisible, setBoardsVisible, promptDeleteBoard, promptCreateBoard, toggleBoardPin, promptEditBoard } = useAppSidebar()

  const boardList = Object.entries(boards).map(([_, b]) => b)
    .sort((a, b) => {
      const aPin = a.pinned ? new Date(a.pinned).getTime() : 0
      const bPin = b.pinned ? new Date(b.pinned).getTime() : 0
      if (bPin - aPin != 0) return bPin - aPin
      return a.name.localeCompare(b.name)
    })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex overflow-hidden items-center gap-2 pt-4 text-xl tracking-wide font-bold">
          <SidebarTrigger size="icon" title={open ? "Collapse Sidebar" : "Expand Sidebar"} />
          <CheckSquare color="lime" className={`min-h-7 min-w-7 ml-4 transition-all`} />
          <span className={`truncate transition-opacity ${open ? "opacity-100" : "opacity-0"}`}>
            GetDone
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <NavigationItem name="Overview" to="/" isOpen={open} icon={<Home className="w-5 h-5" />} />
              <NavigationItem name="Board Gallery" to="/boards" isOpen={open} icon={<Columns3 className="w-5 h-5" />} />
              <NavigationItem name="Weekly Planner" to="/planner" isOpen={open} icon={<CalendarDays className="w-5 h-5" />} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={boardsVisible && open} onOpenChange={setBoardsVisible}>
            <SidebarGroupLabel className={`${!open ? "pointer-events-none" : ""} truncate`}>Your Boards</SidebarGroupLabel>
            <SidebarGroupAction title={boardsVisible ? "Hide Boards" : "Show Boards"}>
              <CollapsibleTrigger>
                <ChevronDown className={`${boardsVisible ? "rotate-180" : ""} duration-300 h-5 w-5 transition-transform`} />
              </CollapsibleTrigger>
            </SidebarGroupAction>
            <SidebarGroupAction onClick={promptCreateBoard} className="mr-6" title="Create Board">
              <Plus className="h-5 w-5" />
            </SidebarGroupAction>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {boardList.map(board => (
                    <BoardTile
                      key={board.id}
                      board={board}
                      handleDelete={() => promptDeleteBoard(board)}
                      handleEdit={() => promptEditBoard(board)}
                      handlePin={() => toggleBoardPin(board.id)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function NavigationItem({ name, to, isOpen, icon }: { name: string, to: string, isOpen: boolean, icon: ReactNode }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={name} className="has-[.selected]:bg-accent transition-colors">
        <NavLink to={to} end className={({ isActive }) => `flex flex-row space-x-1 items-center w-full ${isActive ? "selected" : ""}`}>
          {icon}
          <span className={`${isOpen ? "opacity-100" : "opacity-0"} truncate transition-opacity`}>
            {name}
          </span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function BoardTile({ board, handlePin, handleEdit, handleDelete }: { board: Board, handleDelete: VoidFunction, handlePin: VoidFunction, handleEdit: VoidFunction }) {
  return (
    <SidebarMenuItem className="group/item">
      <ContextMenu>
        <ContextMenuTrigger>
          <SidebarMenuButton tooltip={board.name} className="has-[.selected]:bg-accent transition-colors">
            <NavLink
              to={`/boards/${board.id}`}
              className={({ isActive }) => `flex flex-row items-center w-full ${isActive ? "selected" : ""}`}
            >
              <span className="truncate text-xs">{board.name}</span>
            </NavLink>
          </SidebarMenuButton>

          <SidebarMenuAction title={board.pinned ? "Unpin board" : "Pin board"} onClick={handlePin}
            className={`group-hover/item:flex ${board.pinned ? "" : "hidden"}`}>
            <Pin className={`stroke-chart-2 ${board.pinned ? "fill-chart-2" : ""}`} />
            <span className="sr-only">Add Board</span>
          </SidebarMenuAction>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Board</ContextMenuLabel>
            <ContextMenuItem onClick={handleEdit}>
              <PencilIcon />
              Edit
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" className="w-full" onClick={handleDelete}>
              <TrashIcon />
              Delete
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuItem>
  )
}

