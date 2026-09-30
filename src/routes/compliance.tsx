import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance — Brite AI" },
      { name: "description", content: "Contracts, documents and regulatory rules. Governance module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Compliance — Brite AI" },
      { property: "og:description", content: "Contracts, documents and regulatory rules. Governance module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="compliance" />,
});
