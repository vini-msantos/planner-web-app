import { Outlet } from "react-router";
import AppSidebar from "./Sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import DeleteDialog from "./DeleteDialog";
import { Toaster } from "../ui/toast";
import TaskSheet from "@/features/tasks/TaskSheet";
import BoardDialog from "@/features/boards/BoardDialog";
import ColumnDialog from "@/features/columns/ColumnDialog";
import TaskDialog from "@/features/tasks/TaskDialog";

export default function Shell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh min-w-0 overflow-hidden">
        <div className="h-full w-full bg-background">
          <main className="flex-1 flex flex-col min-w-0 min-h-0">
            <Outlet />
          </main>
          <BoardDialog />
          <ColumnDialog />
          <TaskDialog />
          <DeleteDialog />
          <TaskSheet />
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
