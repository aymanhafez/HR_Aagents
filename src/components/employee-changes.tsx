import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Change = { id: string; field: string; old_value: string; new_value: string; reason: string; approved_by: string; run_id: string | null; created_at: string };

export function EmployeeChanges({ employeeKey, source = "seeded" }: { employeeKey: string; source?: string }) {
  const [rows, setRows] = useState<Change[]>([]);
  useEffect(() => {
    const load = () =>
      supabase.from("employee_changes").select("*").eq("data_source", source).eq("employee_key", employeeKey).order("created_at", { ascending: false })
        .then(({ data }) => setRows((data ?? []) as Change[]));
    load();
    const ch = supabase.channel(`emp-changes-${employeeKey}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "employee_changes" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [employeeKey, source]);

  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <h3 className="font-display text-sm font-semibold">Approved record changes</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No approved changes yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((c) => (
            <li key={c.id} className="rounded-md border border-border p-2 text-xs">
              <div className="font-medium capitalize">{c.field.replace("_", " ")}: <span className="text-muted-foreground line-through">{c.old_value || "—"}</span> → <span className="text-primary">{c.new_value}</span></div>
              <div className="mt-0.5 text-muted-foreground">
                Approved by {c.approved_by} · {new Date(c.created_at).toLocaleDateString()}
                {c.run_id && <> · <Link to="/agents/$runId" params={{ runId: c.run_id }} className="underline">agent run</Link></>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
