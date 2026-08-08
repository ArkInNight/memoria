import { createFileRoute } from "@tanstack/react-router";
import { ImportPage } from "@/features/import/pages/import-page";

export const Route = createFileRoute("/import/")({
  component: ImportPage,
});
