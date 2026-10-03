import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/workforce-planning")({
  head: () => ({
    meta: [
      { title: "Workforce Planning — Nayera AI" },
      { name: "description", content: "Demand, supply and scenario modelling. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Workforce Planning — Nayera AI" },
      { property: "og:description", content: "Demand, supply and scenario modelling. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="workforce-planning" />,
});
