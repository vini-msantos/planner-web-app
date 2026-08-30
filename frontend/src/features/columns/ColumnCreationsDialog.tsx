import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldContent, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import useColumnStore from "@/store/useColumnStore";
import useDialogStore from "@/store/useDialogStore";
import type { Board } from "@/types/models";
import { slugify } from "@/utils/name_utils";

export type ColumnCreationDialogData = {
  onCreate: () => void,
  board: Board,
  position: number,
}

type FormSchema = {
  name: string,
  description: string,
  completes_tasks: string,
}

export default function ColumnCreationDialog() {
  const { active, closeDialog } = useDialogStore()
  const createColumn = useColumnStore(s => s.createColumn)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (active.state != 'createColumn') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData.entries()) as unknown as FormSchema;
    const id = `${active.data.board.id}~${slugify(form.name)}`

    const result = await createColumn({
      ...form,
      completes_tasks: form.completes_tasks == 'on',
      board_id: active.data.board.id,
      position: active.data.position,
      id,
    })
    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Column '${form.name}' created.`
      })
      active.data.onCreate()
      return closeDialog()
    }
    if (result.error == 'invalidName') {
      return toast.add({
        type: 'warning',
        description: `'${form.name}' is invalid or already used.`
      })
    }
    toast.add({
      type: 'error',
      description: `Could not create column '${form.name}'`
    })
  }

  if (active.state != 'createColumn') return <></>
  return (
    <Dialog open={active.state == 'createColumn'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">Creating a new column</DialogTitle>
          <DialogDescription>Columns let you sort your tasks semanticaly, and are expected to flow left to right.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} placeholder="To Do" required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea maxLength={180} id="description" name="description" autoComplete={"off"} placeholder="A place to put my pending tasks." />
            </Field>
            <FieldLabel htmlFor="completes_tasks">
              <Field orientation='horizontal'>
                <FieldContent>
                <FieldTitle>Completes tasks</FieldTitle>
                <FieldDescription>Whether the column should mark the tasks inside it as completed.</FieldDescription>
                </FieldContent>
                <Switch id="completes_tasks" name="completes_tasks"/>
              </Field>
            </FieldLabel>
              
            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">Create column</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

