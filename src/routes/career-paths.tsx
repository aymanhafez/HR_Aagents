import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/career-paths")({
  head: () => ({
    meta: [
      { title: "Career Paths — Brite AI" },
      { name: "description", content: "Progression routes and readiness. Talent module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Career Paths — Brite AI" },
      { property: "og:description", content: "Progression routes and readiness. Talent module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="career-paths" />,
});
