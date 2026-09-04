import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import useBoardStore from "@/store/useBoardStore";
import useDialogStore from "@/store/useDialogStore";
import { formatLine, formatParagraph, slugify } from "@/utils/name_utils";
import { useNavigate } from "react-router";

type FormSchema = {
  name: string,
  description: string,
}

export default function BoardDialog() {
  const { active, closeDialog } = useDialogStore()
  const createBoard = useBoardStore(s => s.createBoard)
  const patchBoard = useBoardStore(s => s.patchBoard)
  const navigate = useNavigate()
  const { state } = active

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = Object.fromEntries(formData) as unknown as FormSchema;

    const id = state == 'editBoard'
      ? active.board.id
      : slugify(form.name)

    const name = formatLine(form.name)
    const description = formatParagraph(form.description)

    const result = state == 'createBoard'
      ? await createBoard({ id, name, description })
      : await patchBoard(id, { name, description })

    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Board '${form.name}' ${state == 'createBoard' ? "created" : "edited" }.`
      })
      closeDialog()
      if (state == 'createBoard') navigate(`/boards/${id}`)
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
      description: `Could not ${state == 'createBoard' ? "create" : "edit"} board '${form.name}'`
    })
  }

  const dialogTitle = state == 'editBoard' ? `Editing ${active.board.name}` : "Creating a new board"
  const namePlaceholder = state == 'editBoard' ? active.board.name : "My amazing board"
  const descriptionPlaceholder = state == 'editBoard' ? active.board.description : "A place to put all my great ideas."
  if (state != 'createBoard' && state != 'editBoard') return <></>
  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold mx-5">{dialogTitle}</DialogTitle>
          {state == 'createBoard' && <DialogDescription>You can create boards to organize your tasks in a column oriented workflow.</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input defaultValue={state == 'editBoard' ? active.board.name : undefined} minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} placeholder={namePlaceholder} required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea defaultValue={state == 'editBoard' ? active.board.description : undefined} className="min-h-25 max-h-60" maxLength={180} id="description" name="description" autoComplete={"off"} placeholder={descriptionPlaceholder} />
            </Field>
            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">{state == 'editBoard' ? "Save changes" : "Create board"}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
