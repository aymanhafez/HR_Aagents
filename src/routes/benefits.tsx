import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Benefits — Brite AI" },
      { name: "description", content: "Plans, enrollment and benefit spend optimization. Pay & Rewards module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Benefits — Brite AI" },
      { property: "og:description", content: "Plans, enrollment and benefit spend optimization. Pay & Rewards module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="benefits" />,
});
