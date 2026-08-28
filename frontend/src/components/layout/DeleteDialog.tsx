import useDialogStore from "@/store/useDialogStore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import type { ApiResult } from "@/utils/result";

export type DeleteDialogData = {
  name: string,
  description: string,
  onConfirm: () => ApiResult<any, any>
}

export default function DeleteDialog() {
  const { active, closeDialog } = useDialogStore()
  const handleConfirm = async () => {
    if (active.state != 'delete') return
    // TODO: Toast
    const result = await active.data.onConfirm()
    if (result.isOk) closeDialog()
  }

  return active.state == 'delete' &&
    <AlertDialog open={active.state == 'delete'} onOpenChange={(open) => !open && closeDialog()}>
      <AlertDialogContent size="default">
        <AlertDialogHeader >
          <AlertDialogTitle><strong className="text-lg">Delete '{active.data.name}'?</strong></AlertDialogTitle>
          <AlertDialogDescription>
            {active.data.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <strong className="text-xs">This action cannot be undone.</strong>
        </ AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={handleConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
}