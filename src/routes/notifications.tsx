import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Brite AI" },
      { name: "description", content: "Grouped alerts by criticality. Automation module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Notifications — Brite AI" },
      { property: "og:description", content: "Grouped alerts by criticality. Automation module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="notifications" />,
});
