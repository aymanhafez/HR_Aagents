import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/ai-audit")({
  head: () => ({
    meta: [
      { title: "AI Audit — Brite AI" },
      { name: "description", content: "Every AI recommendation, decision and outcome. Governance module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "AI Audit — Brite AI" },
      { property: "og:description", content: "Every AI recommendation, decision and outcome. Governance module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="ai-audit" />,
});
