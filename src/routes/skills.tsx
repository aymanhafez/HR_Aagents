import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — Brite AI" },
      { name: "description", content: "Skill inventory, gaps and critical dependency. Talent module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Skills — Brite AI" },
      { property: "og:description", content: "Skill inventory, gaps and critical dependency. Talent module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="skills" />,
});
