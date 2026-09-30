import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Learning — Brite AI" },
      { name: "description", content: "Courses, completion and skill impact. Talent module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Learning — Brite AI" },
      { property: "og:description", content: "Courses, completion and skill impact. Talent module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="learning" />,
});
