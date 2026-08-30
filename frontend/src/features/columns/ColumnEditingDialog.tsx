import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldContent, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import useColumnStore from "@/store/useColumnStore";
import useDialogStore from "@/store/useDialogStore";

type FormSchema = {
  name: string,
  description: string,
  completes_tasks: string,
}

export default function ColumnEditingDialog() {
  const { active, closeDialog } = useDialogStore()
  const patchColumn = useColumnStore(s => s.patchColumn)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (active.state != 'editColumn') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData.entries()) as unknown as FormSchema;

    const result = await patchColumn(active.column.id, {
      ...form,
      completes_tasks: form.completes_tasks == 'on',
    })
    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Column '${active.column.name}' edited.`
      })
      return closeDialog()
    }
    if (result.error == 'invalidName') {
      return toast.add({
        type: 'warning',
        description: `'${form.name}' is invalid or already in use.`
      })
    }
    toast.add({
      type: 'error',
      description: `Could not edit column '${active.column.name}'`
    })
  }

  if (active.state != 'editColumn') return <></>
  return (
    <Dialog open={active.state == 'editColumn'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">Editing '{active.column.name}'</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} defaultValue={active.column.name} placeholder={active.column.name} required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea maxLength={180} id="description" name="description" autoComplete={"off"} defaultValue={active.column.description} placeholder={active.column.description} />
            </Field>
            <FieldLabel htmlFor="completes_tasks">
              <Field orientation='horizontal'>
                <FieldContent>
                  <FieldTitle>Completes tasks</FieldTitle>
                  <FieldDescription>Whether the column should mark the tasks inside it as completed.</FieldDescription>
                </FieldContent>
                <Switch defaultChecked={active.column.completes_tasks} id="completes_tasks" name="completes_tasks" />
              </Field>
            </FieldLabel>

            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">Edit column</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

