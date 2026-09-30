import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Brite AI" },
      { name: "description", content: "Reviews, calibration and coaching. Performance module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Performance — Brite AI" },
      { property: "og:description", content: "Reviews, calibration and coaching. Performance module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="performance" />,
});
