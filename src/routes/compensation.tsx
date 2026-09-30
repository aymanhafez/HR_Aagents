import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/compensation")({
  head: () => ({
    meta: [
      { title: "Compensation — Brite AI" },
      { name: "description", content: "Bands, equity and increment simulation. Pay & Rewards module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Compensation — Brite AI" },
      { property: "og:description", content: "Bands, equity and increment simulation. Pay & Rewards module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="compensation" />,
});
