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

export default function BoardCreationDialog() {
  const { active, closeDialog } = useDialogStore()
  const createBoard = useBoardStore(s => s.createBoard)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as unknown as FormSchema;
    const id = slugify(data.name)
    const result = await createBoard({
      id,
      name: formatLine(data.name),
      description: formatParagraph(data.description),
    })

    if (result.isOk) {
      toast.add({
        type: 'success',
        description: `Board '${data.name}' created.`
      })
      closeDialog()
      navigate(`/boards/${id}`)
      return
    }
    if (result.error == 'invalidName') {
      return toast.add({
        type: 'warning',
        description: `'${data.name}' is invalid or already in use.`
      })
    }
    toast.add({
      type: 'error',
      description: `Could not create board '${data.name}'`
    })
  }
  if (active.state != 'createBoard') return <></>
  return (
    <Dialog open={active.state == 'createBoard'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">Creating a new board</DialogTitle>
          <DialogDescription>You can create boards to organize your tasks in a column oriented workflow.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field >
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input minLength={3} maxLength={40} id="name" name="name" type="text" autoComplete={"off"} placeholder="My amazing board" required />
            </Field>
            <Field >
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea className="min-h-25 max-h-60" maxLength={180} id="description" name="description" autoComplete={"off"} placeholder="A place to put all my great ideas." />
            </Field>
            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">Create board</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

