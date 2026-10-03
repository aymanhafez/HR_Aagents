import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/ai-agents")({
  head: () => ({
    meta: [
      { title: "AI Agents — Nayera AI" },
      { name: "description", content: "The agent network and what each one is allowed to do. Automation module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "AI Agents — Nayera AI" },
      { property: "og:description", content: "The agent network and what each one is allowed to do. Automation module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="ai-agents" />,
});
