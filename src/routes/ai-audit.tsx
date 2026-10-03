import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/ai-audit")({
  head: () => ({
    meta: [
      { title: "AI Audit — Nayera AI" },
      { name: "description", content: "Every AI recommendation, decision and outcome. Governance module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "AI Audit — Nayera AI" },
      { property: "og:description", content: "Every AI recommendation, decision and outcome. Governance module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="ai-audit" />,
});
