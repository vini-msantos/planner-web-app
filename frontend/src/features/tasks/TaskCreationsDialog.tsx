import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import useDialogStore from "@/store/useDialogStore";
import useTaskStore from "@/store/useTaskStore";
import type { Column } from "@/types/models";
import { format } from "date-fns";
import { useState } from "react";

export type TaskCreationDialogData = {
  onCreate: () => void,
  column: Column,
  position: number,
}

type FormSchema = {
  name: string,
  description: string,
}

export default function TaskCreationDialog() {
  const { active, closeDialog } = useDialogStore()
  const createTask = useTaskStore(s => s.createTask)
  const [dueDate, setDate] = useState<Date>()

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (active.state != 'createTask') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData.entries()) as unknown as FormSchema;
    const id = crypto.randomUUID()

    const result = await createTask({
      ...form,
      column_id: active.data.column.id,
      position: active.data.position,
      due_date: dueDate?.toISOString(),
      id,
    })
    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Task '${form.name}' created.`
      })
      active.data.onCreate()
      return closeDialog()
    }
    if (result.error == 'invalidName') {
      return toast.add({
        type: 'warning',
        description: `'${form.name}' is invalid.`
      })
    }
    toast.add({
      type: 'error',
      description: `Could not create task '${form.name}'`
    })
  }

  if (active.state != 'createTask') return <></>
  return (
    <Dialog open={active.state == 'createTask'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">Creating a new task</DialogTitle>
          <DialogDescription>Tasks reside in columns and allow you to track pending activities.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} placeholder="Rest api in rust" required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea maxLength={180} id="description" name="description" autoComplete={"off"} placeholder="Improve my rust skills by making a rest api." />
            </Field>

            <Field>
              <FieldLabel htmlFor="due-date">Due date</FieldLabel>
              <Popover>
                <PopoverTrigger render={
                  <Button variant="outline" id="due-date" className="justify-start font-normal">
                    {dueDate ? format(dueDate, "PPP") : <span className="text-muted-foreground">Select a date or leave empty</span>}
                  </Button>
                }/>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDate}
                    defaultMonth={dueDate}
                  />
                </PopoverContent>
              </Popover>
            </Field>
              
            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">Create task</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

