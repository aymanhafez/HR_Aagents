import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/workforce-planning")({
  head: () => ({
    meta: [
      { title: "Workforce Planning — Brite AI" },
      { name: "description", content: "Demand, supply and scenario modelling. Intelligence module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Workforce Planning — Brite AI" },
      { property: "og:description", content: "Demand, supply and scenario modelling. Intelligence module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="workforce-planning" />,
});
