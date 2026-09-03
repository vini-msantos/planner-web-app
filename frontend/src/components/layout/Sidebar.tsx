import { type ReactNode } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "../ui/sidebar"
import { CalendarDays, CheckSquare, ChevronDown, Columns3, HomeIcon, PinIcon, Plus } from "lucide-react"
import { NavLink } from "react-router"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import useAppSidebar from "@/hooks/useAppSidebar"
import type { Board } from "@/types/models"
import { BoardContextMenu } from "@/features/boards/BoardCard"
import useBoardStore from "@/store/useBoardStore"

export default function AppSidebar() {
  const {
    open,
    boards,
    boardsVisible,
    setBoardsVisible,
    promptCreateBoard,
  } = useAppSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader>
          <div className="flex overflow-hidden items-center gap-2 pt-4 text-xl tracking-wider font-bold">
            <SidebarTrigger size="icon" title={open ? "Collapse Sidebar" : "Expand Sidebar"} />
            <CheckSquare color="lime" className={`min-h-7 min-w-7 ml-4 transition-all`} />
            <span className={`truncate transition-opacity select-none ${open ? "opacity-100" : "opacity-0"}`}>
              GetDone
            </span>
          </div>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupLabel className="pointer-events-none">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <NavigationItem name="Overview" to="/" isOpen={open} icon={<HomeIcon className="w-5 h-5" />} />
              <NavigationItem name="Board Gallery" to="/boards" isOpen={open} icon={<Columns3 className="w-5 h-5" />} />
              <NavigationItem name="Weekly Planner" to="/planner" isOpen={open} icon={<CalendarDays className="w-5 h-5" />} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={boardsVisible && open} onOpenChange={setBoardsVisible}>
            <SidebarGroupLabel className="pointer-events-none truncate">Your Boards</SidebarGroupLabel>
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
                  {boards.map(board => (
                    <BoardTile
                      key={board.id}
                      board={board}
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

function BoardTile({ board }: { board: Board }) {
  const togglePin = useBoardStore(s => s.toggleBoardPin)
  return (
    <SidebarMenuItem className="group/item">
      <BoardContextMenu boardId={board.id}>
        <SidebarMenuButton tooltip={board.name} className="has-[.selected]:bg-accent transition-colors">
          <NavLink
            to={`/boards/${board.id}`}
            className={({ isActive }) => `flex flex-row items-center w-full ${isActive ? "selected" : ""}`}
          >
            <span className="truncate text-xs">{board.name}</span>
          </NavLink>
        </SidebarMenuButton>

        <SidebarMenuAction title={board.pinned ? "Unpin board" : "Pin board"} onClick={() => togglePin(board.id)}
          className={`group-hover/item:flex ${board.pinned ? "" : "hidden"}`}>
          <PinIcon className={`stroke-chart-2 ${board.pinned ? "fill-chart-2" : ""}`} />
        </SidebarMenuAction>
      </BoardContextMenu>
    </SidebarMenuItem>
  )
}

