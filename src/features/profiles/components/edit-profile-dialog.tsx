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

export interface ProfileEditState {
  id: string;
  name: string;
  note: string;
}

function EditProfileDialog({
  editing,
  onClose,
  onSubmit,
}: {
  editing: ProfileEditState | null;
  onClose: () => void;
  onSubmit: (state: ProfileEditState) => Promise<boolean>;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (isPending) return;
    setIsPending(true);
    try {
      if (await onSubmit({ ...editing, name, note })) onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={!!editing} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update the local account archive details.</DialogDescription>
        </DialogHeader>
        {editing && (
          <Form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-profile-name">Profile name</FieldLabel>
                <Input
                  id="edit-profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-profile-note">Note (optional)</FieldLabel>
                <Textarea
                  id="edit-profile-note"
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={isPending}
                />
              </Field>
            </FieldGroup>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              Save
            </Button>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { EditProfileDialog };
