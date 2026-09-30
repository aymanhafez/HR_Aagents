import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/executive")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Brite AI" },
      { name: "description", content: "Company-wide workforce, cost and productivity signals. Intelligence module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Executive Dashboard — Brite AI" },
      { property: "og:description", content: "Company-wide workforce, cost and productivity signals. Intelligence module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="executive" />,
});
