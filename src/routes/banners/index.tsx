import { createFileRoute } from "@tanstack/react-router";
import { BannerArchivePage } from "@/features/banners/pages/banner-archive-page";

export const Route = createFileRoute("/banners/")({
  component: BannerArchivePage,
});
