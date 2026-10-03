import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Nayera AI" },
      { name: "description", content: "People analytics and natural-language questions. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Analytics — Nayera AI" },
      { property: "og:description", content: "People analytics and natural-language questions. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="analytics" />,
});
