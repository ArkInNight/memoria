import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/banners")({
  component: BannersLayout,
});

function BannersLayout() {
  return <Outlet />;
}
