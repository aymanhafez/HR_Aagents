import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/ai-agents")({
  head: () => ({
    meta: [
      { title: "AI Agents — Brite AI" },
      { name: "description", content: "The agent network and what each one is allowed to do. Automation module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "AI Agents — Brite AI" },
      { property: "og:description", content: "The agent network and what each one is allowed to do. Automation module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="ai-agents" />,
});
