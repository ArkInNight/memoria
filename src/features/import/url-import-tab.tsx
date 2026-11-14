import { useState } from "react";
import { Upload } from "lucide-react";

import type { Profile } from "@/shared";
import { extractPageData } from "./extract-page-data";
import { parseRawSummons } from "./parse-raw-summons";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Form } from "@/components/form";
import { useSummonImport } from "./use-summon-import";
import { ImportResultAlerts } from "./import-result-alerts";

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "/api/proxy";

export function UrlImportTab({ profile }: { profile: Profile }) {
  const [url, setUrl] = useState("");
  const { isPending, result, error, runImport } = useSummonImport(profile);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const succeeded = await runImport(async () => {
      if (!url.trim()) throw new Error("Please enter a link first.");

      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body?.error ||
            `Failed to fetch URL (HTTP ${response.status}). The token may have expired.`
        );
      }

      const raw = extractPageData(body);
      if (!raw) throw new Error("Invalid data structure (no pageData).");
      return parseRawSummons(raw);
    });

    if (succeeded) setUrl("");
  };

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="summon-url">Link Grabber URL</FieldLabel>
          <Input
            id="summon-url"
            placeholder="https://game-re-en-service.sl916.com/query/summon?..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={isPending}
            aria-invalid={Boolean(error)}
          />
          <FieldDescription className="text-xs">
            Paste the URL copied by Marconi. The authentication token expires in ~5 minutes.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <ImportResultAlerts result={result} error={error} />

      <Button type="submit" className="self-end" disabled={isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
        {isPending ? "Fetching & Merging..." : "Import Summon Logs"}
      </Button>
    </Form>
  );
}
