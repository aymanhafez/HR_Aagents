import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Learning — Nayera AI" },
      { name: "description", content: "Courses, completion and skill impact. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Learning — Nayera AI" },
      { property: "og:description", content: "Courses, completion and skill impact. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="learning" />,
});
