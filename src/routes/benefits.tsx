import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Benefits — Nayera AI" },
      { name: "description", content: "Plans, enrollment and benefit spend optimization. Pay & Rewards module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Benefits — Nayera AI" },
      { property: "og:description", content: "Plans, enrollment and benefit spend optimization. Pay & Rewards module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="benefits" />,
});
