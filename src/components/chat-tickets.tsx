import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Ticket = { id: string; number: number; request: string; objective: string; run_id: string | null; agent: string; status: string; result: string; created_at: string; updated_at: string };

const variant = (s: string) => (s === "Resolved" ? "secondary" : s === "Blocked" ? "destructive" : "default") as "secondary" | "destructive" | "default";

export function ChatTickets() {
  const q = useQuery({
    queryKey: ["chat-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_tickets").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Ticket[];
    },
  });
  useEffect(() => {
    const ch = supabase.channel("chat-tickets").on("postgres_changes", { event: "*", schema: "public", table: "chat_tickets" }, () => q.refetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="gap-3 p-4 shadow-[var(--shadow-card)]">
      <p className="font-display text-sm font-semibold">Chat tickets</p>
      <p className="text-xs text-muted-foreground">Every request the chat hands to an agent is logged here and updated with the agent's final result.</p>
      {(q.data ?? []).length === 0 ? (
        <p className="text-xs text-muted-foreground">No tickets yet. Ask Nayera AI to get something done.</p>
      ) : (
        <ul className="divide-y divide-border">
          {q.data!.map((t) => (
            <li key={t.id} className="space-y-1 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{t.number}</span>
                <span className="font-medium">{t.request}</span>
                <Badge variant={variant(t.status)} className="ml-auto">{t.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.agent || "Agent"} · opened {new Date(t.created_at).toLocaleString()} · updated {new Date(t.updated_at).toLocaleString()}
                {t.run_id && <> · <Link to="/agents/$runId" params={{ runId: t.run_id }} className="underline">Open run</Link></>}
              </p>
              {t.result && <p className="whitespace-pre-line rounded-md bg-muted p-2 text-xs">{t.result}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
