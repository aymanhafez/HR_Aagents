import { createFileRoute } from "@tanstack/react-router";

import { ModulePage } from "@/components/module-page";

export const Route = createFileRoute("/leave")({
  head: () => ({
    meta: [
      { title: "Leave — Brite AI" },
      { name: "description", content: "Balances, requests and absence risk. Operations module in the Brite AI people intelligence platform." },
      { property: "og:title", content: "Leave — Brite AI" },
      { property: "og:description", content: "Balances, requests and absence risk. Operations module in the Brite AI people intelligence platform." },
    ],
  }),
  component: () => <ModulePage slug="leave" />,
});
