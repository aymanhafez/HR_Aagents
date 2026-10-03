import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance — Nayera AI" },
      { name: "description", content: "Contracts, documents and regulatory rules. Governance module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Compliance — Nayera AI" },
      { property: "og:description", content: "Contracts, documents and regulatory rules. Governance module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="compliance" />,
});
