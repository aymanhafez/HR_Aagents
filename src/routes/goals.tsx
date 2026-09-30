import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Brite AI" },
      { name: "description", content: "Cascaded objectives, quality and execution risk. Performance module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Goals — Brite AI" },
      { property: "og:description", content: "Cascaded objectives, quality and execution risk. Performance module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="goals" />,
});
