import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Nayera AI" },
      { name: "description", content: "Reviews, calibration and coaching. Performance module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Performance — Nayera AI" },
      { property: "og:description", content: "Reviews, calibration and coaching. Performance module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="performance" />,
});
