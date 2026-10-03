import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/executive")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Nayera AI" },
      { name: "description", content: "Company-wide workforce, cost and productivity signals. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Executive Dashboard — Nayera AI" },
      { property: "og:description", content: "Company-wide workforce, cost and productivity signals. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="executive" />,
});
