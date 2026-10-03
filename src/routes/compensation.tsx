import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/compensation")({
  head: () => ({
    meta: [
      { title: "Compensation — Nayera AI" },
      { name: "description", content: "Bands, equity and increment simulation. Pay & Rewards module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Compensation — Nayera AI" },
      { property: "og:description", content: "Bands, equity and increment simulation. Pay & Rewards module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="compensation" />,
});
