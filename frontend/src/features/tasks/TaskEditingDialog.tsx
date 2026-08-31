import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import useDialogStore from "@/store/useDialogStore";
import useTaskStore from "@/store/useTaskStore";
import { formatLine, formatParagraph } from "@/utils/name_utils";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

type FormSchema = {
  name: string,
  description: string,
}

export default function TaskCreationDialog() {
  const { active, closeDialog } = useDialogStore()
  const patchTask = useTaskStore(s => s.patchTask)
  const [dueDate, setDate] = useState<Date>()

  useEffect(() => {
    if (active.state == 'editTask') {
      setDate(active.task.due_date ? new Date(active.task.due_date) : undefined)
    }
  }, [active])

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (active.state != 'editTask') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData.entries()) as unknown as FormSchema;

    const result = await patchTask(active.task.id, {
      name: formatLine(form.name),
      description: formatParagraph(form.description),
      update_due_date: true,
      due_date: dueDate?.toISOString(),
    })
    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Task '${active.task.name}' edited.`
      })
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
      description: `Could not edit task '${active.task.name}'`
    })
  }

  if (active.state != 'editTask') return <></>
  return (
    <Dialog open={active.state == 'editTask'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mx-4.5 text-center text-base font-bold">Editing '{active.task.name}'</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} placeholder={active.task.name} defaultValue={active.task.name} required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea maxLength={180} id="description" name="description" autoComplete={"off"} placeholder={active.task.description} defaultValue={active.task.description} className="min-h-25 max-h-60"/>
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
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

