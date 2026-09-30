import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Brite AI" },
      { name: "description", content: "People analytics and natural-language questions. Intelligence module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Analytics — Brite AI" },
      { property: "og:description", content: "People analytics and natural-language questions. Intelligence module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="analytics" />,
});
