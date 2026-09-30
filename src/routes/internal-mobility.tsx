import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/internal-mobility")({
  head: () => ({
    meta: [
      { title: "Internal Mobility — Brite AI" },
      { name: "description", content: "Internal talent marketplace and redeployment. Talent module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Internal Mobility — Brite AI" },
      { property: "og:description", content: "Internal talent marketplace and redeployment. Talent module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="internal-mobility" />,
});
