import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/shifts")({
  head: () => ({
    meta: [
      { title: "Shifts — Brite AI" },
      { name: "description", content: "Rosters, coverage and shift optimization. Operations module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Shifts — Brite AI" },
      { property: "og:description", content: "Rosters, coverage and shift optimization. Operations module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="shifts" />,
});
