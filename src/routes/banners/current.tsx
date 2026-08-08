import { createFileRoute } from "@tanstack/react-router";
import { CurrentBannersPage } from "@/features/banners/pages/current-banners-page";

export const Route = createFileRoute("/banners/current")({
  component: CurrentBannersPage,
});
