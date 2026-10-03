import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Nayera AI" },
      { name: "description", content: "Pre-boarding, day one readiness and 90-day success. Talent Acquisition module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Onboarding — Nayera AI" },
      { property: "og:description", content: "Pre-boarding, day one readiness and 90-day success. Talent Acquisition module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="onboarding" />,
});
