import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Nayera AI" },
      { name: "description", content: "Time capture, exceptions and overtime control. Operations module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Attendance — Nayera AI" },
      { property: "og:description", content: "Time capture, exceptions and overtime control. Operations module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="attendance" />,
});
