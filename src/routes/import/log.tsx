import { createFileRoute } from "@tanstack/react-router";
import { ImportLogPage } from "@/features/import/pages/import-log-page";

export const Route = createFileRoute("/import/log")({
  component: ImportLogPage,
});
