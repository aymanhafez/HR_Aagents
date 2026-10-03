import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll — Nayera AI" },
      { name: "description", content: "Payroll runs, audit and leakage control. Pay & Rewards module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Payroll — Nayera AI" },
      { property: "og:description", content: "Payroll runs, audit and leakage control. Pay & Rewards module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="payroll" />,
});
