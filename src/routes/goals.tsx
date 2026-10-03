import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Nayera AI" },
      { name: "description", content: "Cascaded objectives, quality and execution risk. Performance module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Goals — Nayera AI" },
      { property: "og:description", content: "Cascaded objectives, quality and execution risk. Performance module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="goals" />,
});
