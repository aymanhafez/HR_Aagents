import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Brite AI" },
      { name: "description", content: "Pre-boarding, day one readiness and 90-day success. Talent Acquisition module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Onboarding — Brite AI" },
      { property: "og:description", content: "Pre-boarding, day one readiness and 90-day success. Talent Acquisition module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="onboarding" />,
});
