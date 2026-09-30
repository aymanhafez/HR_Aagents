import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/organization")({
  head: () => ({
    meta: [
      { title: "Organization — Brite AI" },
      { name: "description", content: "Business units, departments, teams, locations and cost centers. Core HR module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Organization — Brite AI" },
      { property: "og:description", content: "Business units, departments, teams, locations and cost centers. Core HR module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="organization" />,
});
