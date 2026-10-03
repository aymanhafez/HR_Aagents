import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Nayera AI" },
      { name: "description", content: "Connected systems and data flow health. Administration module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Integrations — Nayera AI" },
      { property: "og:description", content: "Connected systems and data flow health. Administration module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="integrations" />,
});
