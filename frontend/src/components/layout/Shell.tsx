import { Outlet } from "react-router";
import AppSidebar from "./Sidebar";
import BoardCreationDialog from "@/features/boards/BoardCreationDialog";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import DeleteDialog from "./DeleteDialog";
import { Toaster } from "../ui/toast";
import BoardEditingDialog from "@/features/boards/BoardEditingDialog";
import ColumnCreationDialog from "@/features/columns/ColumnCreationDialog";
import TaskCreationDialog from "@/features/tasks/TaskCreationsDialog";
import ColumnEditingDialog from "@/features/columns/ColumnEditingDialog";
import TaskEditingDialog from "@/features/tasks/TaskEditingDialog";
import TaskSheet from "@/features/tasks/TaskSheet";

export default function Shell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh min-w-0 overflow-hidden">
        <div className="h-full w-full bg-background">
          <main className="flex-1 flex flex-col min-w-0 min-h-0">
            <Outlet />
          </main>
          <BoardCreationDialog />
          <BoardEditingDialog />
          <ColumnCreationDialog />
          <ColumnEditingDialog />
          <TaskCreationDialog />
          <TaskEditingDialog />
          <DeleteDialog />
          <TaskSheet />
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
