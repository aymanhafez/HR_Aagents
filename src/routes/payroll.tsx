import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll — Brite AI" },
      { name: "description", content: "Payroll runs, audit and leakage control. Pay & Rewards module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Payroll — Brite AI" },
      { property: "og:description", content: "Payroll runs, audit and leakage control. Pay & Rewards module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="payroll" />,
});
