import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/administration")({
  head: () => ({
    meta: [
      { title: "Administration — Brite AI" },
      { name: "description", content: "Roles, permissions, policies and system settings. Administration module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Administration — Brite AI" },
      { property: "og:description", content: "Roles, permissions, policies and system settings. Administration module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="administration" />,
});
