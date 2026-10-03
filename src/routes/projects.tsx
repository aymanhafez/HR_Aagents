import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Nayera AI" },
      { name: "description", content: "Staffing, capacity and delivery risk. Execution module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Projects — Nayera AI" },
      { property: "og:description", content: "Staffing, capacity and delivery risk. Execution module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="projects" />,
});
