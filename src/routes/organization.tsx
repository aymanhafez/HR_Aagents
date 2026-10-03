import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/organization")({
  head: () => ({
    meta: [
      { title: "Organization — Nayera AI" },
      { name: "description", content: "Business units, departments, teams, locations and cost centers. Core HR module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Organization — Nayera AI" },
      { property: "og:description", content: "Business units, departments, teams, locations and cost centers. Core HR module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="organization" />,
});
