import { createFileRoute, Link } from "@tanstack/react-router";

import { KpiGrid, PageHeader } from "@/components/page-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

import { employees } from "@/data/workspace";
import { useDataSource } from "@/lib/data-source";
import { fetchUploadedEmployees } from "@/lib/uploaded-data";

export const Route = createFileRoute("/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — Brite AI" },
      { name: "description", content: "Employee master data, utilization and AI risk flags across the company." },
      { property: "og:title", content: "Employees — Brite AI" },
      { property: "og:description", content: "Employee master data, utilization and AI risk flags." },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { source } = useDataSource();
  const uploaded = useQuery({ queryKey: ["uploaded-employees"], queryFn: fetchUploadedEmployees, enabled: source === "uploaded" });
  if (source === "uploaded") return <UploadedEmployees rows={uploaded.data} loading={uploaded.isLoading} />;
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Core HR"
        title="Employees"
        subtitle="Master data for 1,284 employees, with live utilization and AI risk flags."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Import
            </Button>
            <Button size="sm">Add employee</Button>
          </div>
        }
      />

      <KpiGrid
        kpis={[
          { label: "Total employees", value: "1,284", delta: "+18 MTD", tone: "up" },
          { label: "Average utilization", value: "96%" },
          { label: "Flagged by AI", value: "6" },
          { label: "Open positions", value: "38" },
        ]}
      />

      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                {["Employee", "Department", "Grade", "Manager", "Utilization", "Goals", "AI flag", ""].map((c) => (
                  <th
                    key={c}
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.title}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.grade}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.manager}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium tabular-nums ${
                        e.utilization > 110 ? "text-destructive" : e.utilization < 75 ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {e.utilization}%
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{e.goalAchievement}%</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-primary/30 text-[11px] text-primary">
                      {e.riskFlag}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/employees/$employeeId" params={{ employeeId: e.id }}>
                        Open 360
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function UploadedEmployees({ rows, loading }: { rows?: Awaited<ReturnType<typeof fetchUploadedEmployees>>; loading: boolean }) {
  const list = rows ?? [];
  const util = list.filter((r) => r.utilization != null);
  const avg = util.length ? Math.round(util.reduce((a, r) => a + (r.utilization ?? 0), 0) / util.length) : null;
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Core HR · My data"
        title="Employees"
        subtitle={loading ? "Loading your uploaded data…" : `${list.length} employees from your upload.`}
        actions={<Button asChild size="sm"><Link to="/data-sources">Upload data</Link></Button>}
      />
      <KpiGrid
        kpis={[
          { label: "Total employees", value: String(list.length) },
          { label: "Departments", value: String(new Set(list.map((r) => r.department).filter(Boolean)).size) },
          { label: "Average utilization", value: avg == null ? "—" : `${avg}%` },
          { label: "Flagged", value: String(list.filter((r) => r.risk_flag).length) },
        ]}
      />
      <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                {["Employee", "Department", "Location", "Grade", "Manager", "Utilization", "Goals", "Flag"].map((c) => (
                  <th key={c} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && !loading && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No uploaded employees yet. <Link to="/data-sources" className="text-primary underline">Upload a CSV</Link>.</td></tr>
              )}
              {list.map((e) => (
                <tr key={e.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3"><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.title}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{e.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.location}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.grade}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.manager}</td>
                  <td className="px-4 py-3 tabular-nums">{e.utilization == null ? "—" : `${e.utilization}%`}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{e.goal_achievement == null ? "—" : `${e.goal_achievement}%`}</td>
                  <td className="px-4 py-3">{e.risk_flag && <Badge variant="outline" className="border-primary/30 text-[11px] text-primary">{e.risk_flag}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
