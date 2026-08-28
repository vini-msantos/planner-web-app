import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/useAppStore";
import type { Column } from "@/types/models";
import { Ellipsis, Plus } from "lucide-react";
import { useParams } from "react-router";

export default function BoardPage() {
  const { id } = useParams()
  const columns = useAppStore(s => s.columns)
  const columnList = Object.entries(columns).map(([_, c]) => c)
    .filter(c => c.board_id == id)
    .sort((a, b) => a.position - b.position)


  return (
    <div className="flex flex-col pt-6 pb-2 h-screen w-full">
      <ScrollArea className="h-full">

        <div className="flex w-full max-h-200 h-fit max-w-full pl-6 space-x-6 ">
          {columnList.map(column => (
            <Column data={column} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />

      </ScrollArea>
    </div>
  )
}

function Column({ data }: { data: Column }) {
  const tasks = useAppStore(s => s.tasks)
  const taskList = Object.entries(tasks).map(([_, t]) => t)
    .filter(t => t.column_id == data.id)
    .sort((a, b) => a.position - b.position)

  return (
    <div className="min-w-65 w-65 h-fit group/column">
      <div className="bg-accent w-full h-fit py-4 flex items-center justify-between max-h-full rounded-t-xl border border-b-0 border-border">
        <span className="ml-4 font-bold text-xl tracking-wide">
          {data.name}
        </span>
        <Button variant="ghost" className="mr-2">
          <Ellipsis className="w-5 h-5" />
        </Button>
      </div>

      <div className="group/list bg-card w-full h-fit rounded-b-xl border border-t-0 border-border">
        <Separator />
        <ScrollArea className="h-full max-h-140 p-3 overflow-scroll">
          <div className="space-y-3">
            {/* <div className="w-full h-20 bg-accent border border-border rounded-xl">
            </div>
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />

            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" /> */}
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />
            <div className="w-full h-20 bg-accent border border-border rounded-xl" />

          </div>
        </ScrollArea>
        <Separator />
        <div className="p-3">
          <Button variant="ghost" size='lg' className="group-hover/column:opacity-100 group-hover/column:h-12 h-0 opacity-0 overflow-hidden w-full">
            <Plus className="h-7 w-7" />
          </Button>
        </div>
      </div>
    </div>
  )
}
