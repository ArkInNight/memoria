import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/features/history/pages/history-page";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});
