import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/succession")({
  head: () => ({
    meta: [
      { title: "Succession — Brite AI" },
      { name: "description", content: "Critical roles, successors and readiness. Talent module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Succession — Brite AI" },
      { property: "og:description", content: "Critical roles, successors and readiness. Talent module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="succession" />,
});
