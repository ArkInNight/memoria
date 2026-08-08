import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/import")({
  component: ImportLayout,
});

function ImportLayout() {
  return <Outlet />;
}
