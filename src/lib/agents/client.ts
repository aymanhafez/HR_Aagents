import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

export type AgentRun = {
  id: string; agent: string; objective: string; requested_by_role: string; priority: string; deadline: string | null;
  status: string; progress: number; data_source: string; plan_summary: string; blocker: string;
  report: Record<string, unknown> | null; created_at: string; updated_at: string;
};
export type AgentStep = {
  id: string; run_id: string; idx: number; title: string; tool: string; risk: string; status: string;
  input: Record<string, unknown>; output: { result?: string } | null; evidence: string; error: string; attempts: number;
};
export type AgentApproval = {
  id: string; run_id: string; step_id: string | null; approver_role: string; reason: string; risk: string;
  alternatives: string; status: string; note: string; created_at: string;
};
export type AgentEvent = { id: string; run_id: string; type: string; message: string; created_at: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
const sb = supabase as any;

export function useAgentRuns(filter?: { agent?: string | undefined }) {
  return useQuery({
    queryKey: ["agent-runs", filter?.agent ?? "all"],
    queryFn: async () => {
      let q = sb.from("agent_runs").select("*").order("created_at", { ascending: false }).limit(100);
      if (filter?.agent) q = q.eq("agent", filter.agent);
      const { data, error } = await q;
      if (error) throw error;
      return data as AgentRun[];
    },
  });
}

export function usePendingAgentApprovals() {
  return useQuery({
    queryKey: ["agent-approvals", "pending"],
    queryFn: async () => {
      const { data, error } = await sb.from("agent_approvals").select("*, agent_runs(objective, agent)").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      return data as (AgentApproval & { agent_runs: { objective: string; agent: string } | null })[];
    },
  });
}

export function useAgentRun(id: string) {
  return useQuery({
    queryKey: ["agent-run", id],
    queryFn: async () => {
      const [r, s, a, e] = await Promise.all([
        sb.from("agent_runs").select("*").eq("id", id).maybeSingle(),
        sb.from("agent_steps").select("*").eq("run_id", id).order("idx"),
        sb.from("agent_approvals").select("*").eq("run_id", id).order("created_at"),
        sb.from("agent_events").select("*").eq("run_id", id).order("created_at", { ascending: false }).limit(100),
      ]);
      if (r.error) throw r.error;
      return { run: r.data as AgentRun | null, steps: (s.data ?? []) as AgentStep[], approvals: (a.data ?? []) as AgentApproval[], events: (e.data ?? []) as AgentEvent[] };
    },
  });
}

/** Live updates: any change on agent tables refreshes agent queries. */
export function useAgentRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase.channel(`agents-${Math.random().toString(36).slice(2)}`);
    for (const table of ["agent_runs", "agent_steps", "agent_approvals", "agent_events"]) {
      ch.on("postgres_changes" as any, { event: "*", schema: "public", table }, () => {
        qc.invalidateQueries({ queryKey: ["agent-runs"] });
        qc.invalidateQueries({ queryKey: ["agent-run"] });
        qc.invalidateQueries({ queryKey: ["agent-approvals"] });
      });
    }
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
}
