import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Brite AI" },
      { name: "description", content: "Time capture, exceptions and overtime control. Operations module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Attendance — Brite AI" },
      { property: "og:description", content: "Time capture, exceptions and overtime control. Operations module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="attendance" />,
});
