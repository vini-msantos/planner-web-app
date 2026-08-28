import { Outlet } from "react-router";
import AppSidebar from "./Sidebar";
import BoardCreationDialog from "@/features/boards/BoardCreationDialog";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import DeleteDialog from "./DeleteDialog";

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
          <DeleteDialog />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
