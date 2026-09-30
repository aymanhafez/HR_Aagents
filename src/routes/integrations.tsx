import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Brite AI" },
      { name: "description", content: "Connected systems and data flow health. Administration module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Integrations — Brite AI" },
      { property: "og:description", content: "Connected systems and data flow health. Administration module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="integrations" />,
});
