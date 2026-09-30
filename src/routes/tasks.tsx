import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Brite AI" },
      { name: "description", content: "HR and manager task queue with AI-created follow-ups. Execution module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Tasks — Brite AI" },
      { property: "og:description", content: "HR and manager task queue with AI-created follow-ups. Execution module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="tasks" />,
});
