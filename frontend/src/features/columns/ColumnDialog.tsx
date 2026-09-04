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
import { formatLine, formatParagraph, slugify } from "@/utils/name_utils";

export type ColumnCreationDialogData = {
  board: Board,
  position: number,
}

type FormSchema = {
  name: string,
  description: string,
  completes_tasks: string,
}

export default function ColumnDialog() {
  const { active, closeDialog } = useDialogStore()
  const createColumn = useColumnStore(s => s.createColumn)
  const patchColumn = useColumnStore(s => s.patchColumn)
  const { state } = active

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (state != 'createColumn' && state != 'editColumn') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData) as unknown as FormSchema;
    const id = state == 'editColumn'
      ? active.column.id
      : `${active.data.board.id}~${slugify(form.name)}`

    const name = formatLine(form.name)
    const description = formatParagraph(form.description)

    const result = state == 'createColumn'
      ? await createColumn({
                name,
                description,
                completes_tasks: form.completes_tasks == 'on',
                board_id: active.data.board.id,
                position: active.data.position,
                id,
              })
      : await patchColumn(id, { name, description, completes_tasks: form.completes_tasks == 'on'})

    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Column '${form.name}' ${state == 'createColumn' ? "created" : "edited" }.`
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

  const dialogTitle = state == 'editColumn' ? `Editing ${active.column.name}` : "Creating a new column" 
  const namePlaceholder = state == 'editColumn' ? active.column.name : "To Do"
  const descriptionPlaceholder = state == 'editColumn' ? active.column.description : "A place to put my pending tasks."
  if (state != 'createColumn' && state != 'editColumn') return <></>
  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold mx-5">{dialogTitle}</DialogTitle>
          {state == 'createColumn' && <DialogDescription>Columns let you sort your tasks semanticaly, and are expected to flow left to right.</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input defaultValue={state == 'editColumn' ? active.column.name : undefined} minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} placeholder={namePlaceholder} required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea defaultValue={state == 'editColumn' ? active.column.description : undefined} maxLength={180} id="description" name="description" autoComplete={"off"} placeholder={descriptionPlaceholder} className="min-h-25 max-h-60"/>
            </Field>
            <FieldLabel htmlFor="completes_tasks">
              <Field orientation='horizontal'>
                <FieldContent>
                  <FieldTitle>Completes tasks</FieldTitle>
                  <FieldDescription>Whether the column should mark the tasks inside it as completed.</FieldDescription>
                </FieldContent>
                <Switch id="completes_tasks" name="completes_tasks" defaultChecked={state == 'editColumn' ? active.column.completes_tasks : false}/>
              </Field>
            </FieldLabel>

            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">{state == 'editColumn' ? "Save changes" : "Create column"}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
