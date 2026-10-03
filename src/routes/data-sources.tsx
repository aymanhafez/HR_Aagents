import { createFileRoute } from "@tanstack/react-router";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useDataSource } from "@/lib/data-source";
import { mapRow } from "@/lib/uploaded-data";
import { buildFullSeed, SEED_DEPARTMENTS, SEED_TAG } from "@/data/full-seed";

export const Route = createFileRoute("/data-sources")({
  head: () => ({
    meta: [
      { title: "Data Sources — Nayera AI" },
      { name: "description", content: "Upload your own employee data and switch Nayera AI between sample and real data." },
      { property: "og:title", content: "Data Sources — Nayera AI" },
      { property: "og:description", content: "Upload your own employee data and switch Nayera AI between sample and real data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DataSourcesPage,
});

function DataSourcesPage() {
  const { source, setSource } = useDataSource();
  const [count, setCount] = useState<number | null>(null);
  const [seedCount, setSeedCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { count } = await supabase.from("uploaded_employees").select("id", { count: "exact", head: true });
    setCount(count ?? 0);
    const s = await supabase.from("uploaded_employees").select("id", { count: "exact", head: true }).eq("extra->>seed", SEED_TAG);
    setSeedCount(s.count ?? 0);
  };
  useEffect(() => { void refresh(); }, []);

  const onFile = (file: File) => {
    setBusy(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = res.data.map(mapRow).filter((r) => r.name);
        if (rows.length === 0) {
          toast.error("No rows with a Name column were found.");
          setBusy(false);
          return;
        }
        for (let i = 0; i < rows.length; i += 500) {
          const { error } = await supabase.from("uploaded_employees").insert(rows.slice(i, i + 500));
          if (error) { toast.error(error.message); setBusy(false); return; }
        }
        toast.success(`${rows.length} employees uploaded`);
        setSource("uploaded");
        await refresh();
        setBusy(false);
      },
      error: (err) => { toast.error(err.message); setBusy(false); },
    });
  };

  const clearAll = async () => {
    if (!confirm("Delete all uploaded employees?")) return;
    const { error } = await supabase.from("uploaded_employees").delete().not("id", "is", null);
    if (error) { toast.error(error.message); return; }
    toast.success("Uploaded data cleared");
    setSource("seeded");
    await refresh();
  };

  const toggleSeed = async () => {
    setBusy(true);
    if (seedCount) {
      const { error } = await supabase.from("uploaded_employees").delete().eq("extra->>seed", SEED_TAG);
      if (error) toast.error(error.message); else toast.success("Full sample company turned off");
    } else {
      const { error } = await supabase.from("uploaded_employees").insert(buildFullSeed());
      if (error) toast.error(error.message);
      else { toast.success(`Full sample company loaded across ${SEED_DEPARTMENTS} departments`); setSource("uploaded"); }
    }
    await refresh();
    setBusy(false);
  };

  const downloadTemplate = () => {
    const csv = "Name,Title,Department,Location,Manager,Grade,Type,Joined,Status,Salary,Utilization,Goals,Risk\nJane Doe,Analyst,Finance,Cairo,John Smith,G4,Full time,2023-01-10,Active,42000,95,88,\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "nayera-employees-template.csv";
    a.click();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader eyebrow="Administration" title="Data Sources" subtitle="Choose which data the app and Nayera AI work from." />

      <div className="grid gap-4 md:grid-cols-2">
        {(["seeded", "uploaded"] as const).map((s) => (
          <Card
            key={s}
            onClick={() => setSource(s)}
            className={`cursor-pointer p-5 transition-colors ${source === s ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"}`}
          >
            <p className="font-display font-semibold">{s === "seeded" ? "Sample company" : "My uploaded data"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {s === "seeded"
                ? "Built-in demo company with 1,284 employees."
                : count === null ? "Loading…" : `${count} employees uploaded.`}
            </p>
            {source === s && <p className="mt-3 text-xs font-medium text-primary">In use</p>}
          </Card>
        ))}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-display font-semibold">Full sample company</p>
          <p className="text-sm text-muted-foreground">
            {seedCount
              ? `On — ${seedCount} employees across ${SEED_DEPARTMENTS} departments, with salaries, performance, leave, overtime and skills. Agents can change these records.`
              : `Load a complete company across ${SEED_DEPARTMENTS} departments into My data so agents can run full tasks.`}
          </p>
        </div>
        <Button onClick={toggleSeed} disabled={busy} variant={seedCount ? "outline" : "default"}>
          {busy ? "Working…" : seedCount ? "Turn off" : "Turn on"}
        </Button>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <p className="font-display font-semibold">Upload employees (CSV)</p>
          <p className="text-sm text-muted-foreground">
            Columns recognised: Name (required), Title, Department, Location, Manager, Grade, Type, Joined, Status, Salary, Utilization, Goals, Risk. Any other columns are kept too.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild disabled={busy}>
            <label className="cursor-pointer">
              {busy ? "Uploading…" : "Choose CSV file"}
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
              />
            </label>
          </Button>
          <Button variant="outline" onClick={downloadTemplate}>Download template</Button>
          <Button variant="ghost" onClick={clearAll} disabled={!count}>Clear uploaded data</Button>
        </div>
      </Card>
    </div>
  );
}
