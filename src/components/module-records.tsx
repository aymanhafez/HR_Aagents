import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bot, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useStartRun } from "@/components/agents/agent-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { agentForModule } from "@/data/agents";
import { employees } from "@/data/workspace";
import { supabase } from "@/integrations/supabase/client";
import { useDataSource } from "@/lib/data-source";
import { fetchUploadedEmployees } from "@/lib/uploaded-data";

type Rec = { id: string; title: string; employee_name: string; details: string; amount: number | null; status: string; created_by: string; run_id: string | null; created_at: string };

export function ModuleRecords({ slug, label, openSignal }: { slug: string; label: string; openSignal: number }) {
  const { source } = useDataSource();
  const agent = agentForModule(slug);
  const { run, pending } = useStartRun();
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState("");
  const [f, setF] = useState({ title: "", employee: "", details: "", amount: "", status: "Open" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (openSignal) setOpen(true); }, [openSignal]);

  const uploaded = useQuery({ queryKey: ["uploaded-employees"], queryFn: fetchUploadedEmployees, enabled: source === "uploaded" });
  const names = source === "uploaded" ? (uploaded.data ?? []).map((e) => e.name) : employees.map((e) => e.name);

  const recs = useQuery({
    queryKey: ["module-records", slug, source],
    queryFn: async () => {
      const { data, error } = await supabase.from("module_records").select("*").eq("module", slug).eq("data_source", source).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Rec[];
    },
  });
  useEffect(() => {
    const ch = supabase.channel(`recs-${slug}`).on("postgres_changes", { event: "*", schema: "public", table: "module_records" }, () => recs.refetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const save = async () => {
    if (!f.title.trim()) { toast.error("Add a title first."); return; }
    setSaving(true);
    const amount = parseFloat(f.amount);
    const { error } = await supabase.from("module_records").insert({
      module: slug, data_source: source, title: f.title.trim(), employee_name: f.employee, details: f.details,
      amount: Number.isFinite(amount) ? amount : null, status: f.status, created_by: "manual",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Record added");
    setF({ title: "", employee: "", details: "", amount: "", status: "Open" });
    setOpen(false);
    recs.refetch();
  };

  return (
    <Card className="gap-4 p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-sm font-semibold">{label} records</p>
        <Button size="sm" variant={open ? "outline" : "default"} className="ml-auto gap-1.5" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-3.5 w-3.5" />{open ? "Close" : "Add manually"}
        </Button>
      </div>

      {agent && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder={`Tell ${agent.name} what to do, e.g. "${agent.starters[0] ?? "create a new record"}"`}
            onKeyDown={(e) => { if (e.key === "Enter") run(ask, agent.id, "High"); }} />
          <Button className="gap-2" disabled={pending || !ask.trim()} onClick={() => run(ask, agent.id, "High")}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}Run with agent
          </Button>
        </div>
      )}

      {open && (
        <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
          <Input placeholder="Title (required)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Select value={f.employee} onValueChange={(v) => setF({ ...f, employee: v })}>
            <SelectTrigger><SelectValue placeholder="Employee (optional)" /></SelectTrigger>
            <SelectContent>{names.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Amount (optional)" inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Open", "In progress", "Pending approval", "Approved", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea className="sm:col-span-2" rows={2} placeholder="Details" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
          <Button className="sm:col-span-2" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save record"}</Button>
        </div>
      )}

      {(recs.data ?? []).length === 0 ? (
        <p className="text-xs text-muted-foreground">No records yet. Add one manually or ask the agent.</p>
      ) : (
        <ul className="divide-y divide-border">
          {recs.data!.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
              <span className="font-medium">{r.title}</span>
              {r.employee_name && <span className="text-xs text-muted-foreground">· {r.employee_name}</span>}
              {r.amount != null && <span className="text-xs tabular-nums text-muted-foreground">· {r.amount.toLocaleString()}</span>}
              <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {r.created_by === "manual" ? "Added manually" : r.run_id ? <Link to="/agents/$runId" params={{ runId: r.run_id }} className="underline">By {r.created_by}</Link> : `By ${r.created_by}`}
              </span>
              {r.details && <p className="w-full text-xs text-muted-foreground">{r.details}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
