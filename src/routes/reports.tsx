import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Brite AI" },
      { name: "description", content: "Scheduled and on-demand reporting. Intelligence module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Reports — Brite AI" },
      { property: "og:description", content: "Scheduled and on-demand reporting. Intelligence module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="reports" />,
});
