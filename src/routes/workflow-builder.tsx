import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/workflow-builder")({
  head: () => ({
    meta: [
      { title: "Workflow Builder — Brite AI" },
      { name: "description", content: "Triggers, conditions, approvals and AI analysis steps. Automation module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Workflow Builder — Brite AI" },
      { property: "og:description", content: "Triggers, conditions, approvals and AI analysis steps. Automation module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="workflow-builder" />,
});
