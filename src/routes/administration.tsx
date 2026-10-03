import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/administration")({
  head: () => ({
    meta: [
      { title: "Administration — Nayera AI" },
      { name: "description", content: "Roles, permissions, policies and system settings. Administration module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Administration — Nayera AI" },
      { property: "og:description", content: "Roles, permissions, policies and system settings. Administration module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="administration" />,
});
