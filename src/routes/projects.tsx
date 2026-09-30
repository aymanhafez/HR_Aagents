import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Brite AI" },
      { name: "description", content: "Staffing, capacity and delivery risk. Execution module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Projects — Brite AI" },
      { property: "og:description", content: "Staffing, capacity and delivery risk. Execution module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="projects" />,
});
