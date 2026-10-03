import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — Nayera AI" },
      { name: "description", content: "Requisitions, pipeline and hiring quality. Talent Acquisition module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Recruitment — Nayera AI" },
      { property: "og:description", content: "Requisitions, pipeline and hiring quality. Talent Acquisition module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="recruitment" />,
});
