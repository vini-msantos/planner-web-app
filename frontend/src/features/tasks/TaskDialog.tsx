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
import { formatLine, formatParagraph } from "@/utils/name_utils";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export type TaskCreationDialogData = {
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
  const patchTask = useTaskStore(s => s.patchTask)
  const [dueDate, setDate] = useState<Date>()
  const { state } = active

  useEffect(() => {
    if (active.state == 'editTask') {
      setDate(active.task.due_date ? new Date(active.task.due_date) : undefined)
    }
  }, [active])

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (active.state != 'createTask' && active.state != 'editTask') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData) as unknown as FormSchema;
    const id = state == 'editTask' ? active.task.id : crypto.randomUUID()

    const name = state == 'editTask' ? active.task.name : formatLine(form.name)
    const description = state == 'editTask' ? active.task.name : formatParagraph(form.description)
    const result = state == 'createTask'
      ? await createTask({
                name,
                description,
                column_id: active.data.column.id,
                position: active.data.position,
                due_date: dueDate?.toISOString(),
                id,
              })
      : await patchTask(id, {
                name,
                description,
                update_due_date: true,
                due_date: dueDate?.toISOString(),
              })

    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Task '${form.name}' ${state == 'createTask' ? "created" : "edited" }.`
      })
      closeDialog()
      return
    }
    if (result.error == 'invalidName') {
      return toast.add({
        type: 'warning',
        description: `'${form.name}' is invalid or already in use.`
      })
    }
    toast.add({
      type: 'error',
      description: `Could not ${state == 'createColumn' ? "create" : "edit"} column '${form.name}'`
    })
  }

  const dialogTitle = state == 'editTask' ? `Editing ${active.task.name}` : "Creating a new task"
  const namePlaceholder = state == 'editTask' ? active.task.name : "Rest api in rust"
  const descriptionPlaceholder = state == 'editTask' ? active.task.description : "Improve my rust skills by making a rest api."
  if (state != 'createTask' && state != 'editTask') return <></>
  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold mx-5">{dialogTitle}</DialogTitle>
          {state == 'createTask' && <DialogDescription>Tasks reside in columns and allow you to track pending activities.</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input defaultValue={state == 'editTask' ? active.task.name : undefined} minLength={3} maxLength={100} id="name" name="name" type="text" autoComplete={"off"} placeholder={namePlaceholder} required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea defaultValue={state == 'editTask' ? active.task.description : undefined} id="description" name="description" autoComplete={"off"} placeholder={descriptionPlaceholder} className="min-h-25 max-h-60"/>
            </Field>

            <Field>
              <FieldLabel htmlFor="due-date">Due date</FieldLabel>
              <Popover>
                <div className="flex flex-row items-center">
                  <PopoverTrigger render={
                    <Button variant="outline" id="due-date" className="justify-start font-normal grow">
                      {dueDate ? format(dueDate, "PPP") : <span className="text-muted-foreground">Select a date or leave empty</span>}
                    </Button>
                  } />
                  {dueDate && <Button title="Remove due date" className="ml-2" variant="ghost" size="icon" onClick={() => setDate(undefined)}>
                    <XIcon className="stroke-muted-foreground" />
                  </Button>}
                </div>

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
              <Button type="submit">{state == 'editTask' ? "Save changes" : "Create task"}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

