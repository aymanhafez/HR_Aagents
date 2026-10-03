import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Nayera AI" },
      { name: "description", content: "Grouped alerts by criticality. Automation module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Notifications — Nayera AI" },
      { property: "og:description", content: "Grouped alerts by criticality. Automation module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="notifications" />,
});
