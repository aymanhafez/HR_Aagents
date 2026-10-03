import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/succession")({
  head: () => ({
    meta: [
      { title: "Succession — Nayera AI" },
      { name: "description", content: "Critical roles, successors and readiness. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Succession — Nayera AI" },
      { property: "og:description", content: "Critical roles, successors and readiness. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="succession" />,
});
