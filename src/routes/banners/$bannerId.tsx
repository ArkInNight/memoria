import { createFileRoute } from "@tanstack/react-router";
import { BannerDetailPage } from "@/features/banners/pages/banner-detail-page";

export const Route = createFileRoute("/banners/$bannerId")({
  component: BannerDetailPage,
});
