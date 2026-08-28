import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useBoardStore from "@/store/useBoardStore";
import useDialogStore from "@/store/useDialogStore";
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
    const id = crypto.randomUUID()
    const result = await createBoard({ name: data.name, description: data.description, id })
    if (result.isOk) {
      closeDialog()
      navigate(`/boards/${id}`)
    }
  }

  return active.state == 'createBoard' &&
    <Dialog open={active.state == 'createBoard'} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">Create a new board</DialogTitle>
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
              <Textarea className="min-h-25" maxLength={180} id="description" name="description" autoComplete={"off"} placeholder="A place to put all my great ideas." />
            </Field>
            <DialogFooter>
              <Button variant={'outline'} onClickCapture={() => closeDialog()}>Cancel</Button>
              <Button type="submit">Create board</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>;
}

