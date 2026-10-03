import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/internal-mobility")({
  head: () => ({
    meta: [
      { title: "Internal Mobility — Nayera AI" },
      { name: "description", content: "Internal talent marketplace and redeployment. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Internal Mobility — Nayera AI" },
      { property: "og:description", content: "Internal talent marketplace and redeployment. Talent module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="internal-mobility" />,
});
