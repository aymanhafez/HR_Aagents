import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Nayera AI" },
      { name: "description", content: "Scheduled and on-demand reporting. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Reports — Nayera AI" },
      { property: "og:description", content: "Scheduled and on-demand reporting. Intelligence module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="reports" />,
});
