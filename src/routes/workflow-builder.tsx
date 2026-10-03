import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/workflow-builder")({
  head: () => ({
    meta: [
      { title: "Workflow Builder — Nayera AI" },
      { name: "description", content: "Triggers, conditions, approvals and AI analysis steps. Automation module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Workflow Builder — Nayera AI" },
      { property: "og:description", content: "Triggers, conditions, approvals and AI analysis steps. Automation module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="workflow-builder" />,
});
