import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/form";
import { Spinner } from "@/components/ui/spinner";

function CreateProfileDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, note: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPending) return;
    setIsPending(true);
    try {
      if (await onSubmit(name, note)) onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Profile</DialogTitle>
          <DialogDescription>Create a local account archive for summon history.</DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-profile-name">
                Profile name (e.g., main account)
              </FieldLabel>
              <Input
                id="create-profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Account"
                autoFocus
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-profile-note">Note (optional)</FieldLabel>
              <Textarea
                id="create-profile-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g., account since version 1.0"
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            Save
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateProfileDialog };
