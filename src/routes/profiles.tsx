import { createFileRoute } from "@tanstack/react-router";
import { ProfilesPage } from "@/features/profiles/pages/profiles-page";

export const Route = createFileRoute("/profiles")({
  component: ProfilesPage,
});
