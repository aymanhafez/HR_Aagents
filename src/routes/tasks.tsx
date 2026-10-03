import { createFileRoute } from "@tanstack/react-router";

import { ChatTasks } from "@/components/chat-tasks";
import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Nayera AI" },
      { name: "description", content: "HR and manager task queue with AI-created follow-ups. Execution module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Tasks — Nayera AI" },
      { property: "og:description", content: "HR and manager task queue with AI-created follow-ups. Execution module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <div className="mx-auto max-w-7xl"><ChatTasks /></div>
      <ModulePage slug="tasks" />
    </div>
  ),
});
