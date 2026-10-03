import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/leave")({
  head: () => ({
    meta: [
      { title: "Leave — Nayera AI" },
      { name: "description", content: "Balances, requests and absence risk. Operations module in the Nayera AI people intelligence platform." },
      { property: "og:title", content: "Leave — Nayera AI" },
      { property: "og:description", content: "Balances, requests and absence risk. Operations module in the Nayera AI people intelligence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ModulePage slug="leave" />,
});
