import { createFileRoute } from "@tanstack/react-router";
import { BannerDetailPage } from "@/features/banners/banner-detail-page";

export const Route = createFileRoute("/banners/$bannerId")({
  component: BannerDetailPage,
});
