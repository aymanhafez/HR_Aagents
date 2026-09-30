import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/employee-relations")({
  head: () => ({
    meta: [
      { title: "Employee Relations — Brite AI" },
      { name: "description", content: "Cases, grievances and resolution quality. Governance module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Employee Relations — Brite AI" },
      { property: "og:description", content: "Cases, grievances and resolution quality. Governance module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="employee-relations" />,
});
