import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SummonRecord } from "@/shared";

function DeleteSummonDialog({
  summon,
  onClose,
  onConfirm,
}: {
  summon: SummonRecord | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={Boolean(summon)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Move {summon?.name} to Trash?</AlertDialogTitle>
          <AlertDialogDescription>
            The record will be removed from history and statistics. You can restore it later from
            the Trash view.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Move to Trash
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteSummonDialog };
