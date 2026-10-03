import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/career-paths")({
  head: () => ({
    meta: [
      { title: "Career Paths — Nayera AI" },
      { name: "description", content: "Progression routes and readiness. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Career Paths — Nayera AI" },
      { property: "og:description", content: "Progression routes and readiness. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="career-paths" />,
});
