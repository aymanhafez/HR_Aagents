import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/shifts")({
  head: () => ({
    meta: [
      { title: "Shifts — Nayera AI" },
      { name: "description", content: "Rosters, coverage and shift optimization. Operations module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Shifts — Nayera AI" },
      { property: "og:description", content: "Rosters, coverage and shift optimization. Operations module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="shifts" />,
});
