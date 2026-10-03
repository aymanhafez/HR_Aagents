import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/employee-relations")({
  head: () => ({
    meta: [
      { title: "Employee Relations — Nayera AI" },
      { name: "description", content: "Cases, grievances and resolution quality. Governance module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Employee Relations — Nayera AI" },
      { property: "og:description", content: "Cases, grievances and resolution quality. Governance module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="employee-relations" />,
});
