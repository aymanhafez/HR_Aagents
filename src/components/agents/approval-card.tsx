import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { decideAgentApproval } from "@/lib/agents/agents.functions";
import type { AgentApproval } from "@/lib/agents/client";

export function ApprovalCard({ a, onDone }: { a: AgentApproval; onDone?: () => void }) {
  const decide = useServerFn(decideAgentApproval);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (decision: "approve" | "reject" | "modify") => {
    if (decision === "modify" && !note.trim()) { toast.error("Write what to change first."); return; }
    setBusy(true);
    try { await decide({ data: { id: a.id, decision, note } }); toast.success(`Decision recorded: ${decision}`); onDone?.(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not record decision"); }
    finally { setBusy(false); }
  };
  return (
    <Card className="gap-2 border-primary/40 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <p className="font-display text-sm font-semibold">Approval needed · {a.approver_role}</p>
        <Badge variant="destructive" className="text-[10px]">{a.risk} risk</Badge>
      </div>
      <p className="text-sm">{a.reason}</p>
      {a.alternatives && <p className="text-xs text-muted-foreground">Alternatives: {a.alternatives}</p>}
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note, or what to change (for Modify)" />
      <div className="flex gap-2">
        <Button size="sm" disabled={busy} onClick={() => go("approve")}>Approve</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => go("modify")}>Modify</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => go("reject")}>Reject</Button>
      </div>
    </Card>
  );
}
