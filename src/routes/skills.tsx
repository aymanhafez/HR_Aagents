import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — Nayera AI" },
      { name: "description", content: "Skill inventory, gaps and critical dependency. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Skills — Nayera AI" },
      { property: "og:description", content: "Skill inventory, gaps and critical dependency. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="skills" />,
});
