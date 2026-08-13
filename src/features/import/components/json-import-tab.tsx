import { useState } from "react";
import { Upload } from "lucide-react";

import type { Profile } from "@/lib/shared";
import { extractPageData } from "@/lib/domain/extractPageData";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Form } from "@/components/form";
import { useSummonImport } from "../hooks/use-summon-import";
import { ImportResultAlerts } from "./import-result-alerts";

export function JsonImportTab({ profile }: { profile: Profile }) {
  const [jsonText, setJsonText] = useState("");
  const { isPending, result, error, runImport } = useSummonImport(profile);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const succeeded = await runImport(async () => {
      if (!jsonText.trim()) throw new Error("Please enter JSON data first.");

      const parsed = extractPageData(JSON.parse(jsonText.trim()));
      if (!parsed) {
        throw new Error("Invalid JSON structure. It must contain a pageData array or a raw array.");
      }
      return parsed;
    });

    if (succeeded) setJsonText("");
  };

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="summon-json">Raw JSON Response</FieldLabel>
          <Textarea
            id="summon-json"
            placeholder='{ "code": 200, "data": { "pageData": [...] } }'
            rows={8}
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            disabled={isPending}
            aria-invalid={Boolean(error)}
            className="font-mono text-xs"
          />
        </Field>
      </FieldGroup>

      <ImportResultAlerts result={result} error={error} />

      <Button type="submit" className="self-end" disabled={isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
        {isPending ? "Parsing & Merging..." : "Import Summon Logs"}
      </Button>
    </Form>
  );
}
