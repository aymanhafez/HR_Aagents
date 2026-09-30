import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — Brite AI" },
      { name: "description", content: "Requisitions, pipeline and hiring quality. Talent Acquisition module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Recruitment — Brite AI" },
      { property: "og:description", content: "Requisitions, pipeline and hiring quality. Talent Acquisition module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="recruitment" />,
});
