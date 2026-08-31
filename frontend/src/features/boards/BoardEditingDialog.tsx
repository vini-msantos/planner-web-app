import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import useBoardStore from "@/store/useBoardStore";
import useDialogStore from "@/store/useDialogStore";
import { formatLine, formatParagraph } from "@/utils/name_utils";

type FormSchema = {
  name: string,
  description: string,
}

export default function BoardEditingDialog() {
  const { active, closeDialog } = useDialogStore()
  const patchBoard = useBoardStore(s => s.patchBoard)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    if (active.state != 'editBoard') return
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as unknown as FormSchema;
    const result = await patchBoard(active.board.id, {
      name: formatLine(data.name),
      description: formatParagraph(data.description),
    })
    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Edited '${active.board.name}'.`
      })
      return closeDialog()
    }
    if (result.error == 'invalidName') {
      return toast.add({
        type: 'warning',
        description: `${data.name} Board name is invalid or already in use.`
      })
    }
    toast.add({
      type: 'error',
      description: `Could not edit ${active.board.name}.`
    })
  }

  if (active.state != 'editBoard') return <></>
  return (
    <Dialog open={active.state == 'editBoard'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">Editing '{active.board.name}'</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input defaultValue={active.board.name} placeholder={active.board.name} minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea defaultValue={active.board.description} placeholder={active.board.description} className="min-h-25 max-h-60" maxLength={180} id="description" name="description" autoComplete={"off"} />
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

