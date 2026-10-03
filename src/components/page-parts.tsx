import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Brain } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Kpi } from "@/data/modules";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="gap-0 p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">{kpi.value}</p>
          {kpi.delta && (
            <p
              className={`mt-1 flex items-center gap-1 text-xs ${
                kpi.tone === "down" ? "text-[var(--success)]" : "text-primary"
              }`}
            >
              {kpi.tone === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
              {kpi.delta}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              {columns.map((c) => (
                <th key={c} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-2.5 ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {renderCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const TONES: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/25",
  high: "bg-primary/10 text-primary border-primary/25",
  "at risk": "bg-primary/10 text-primary border-primary/25",
  overdue: "bg-destructive/10 text-destructive border-destructive/25",
  understaffed: "bg-primary/10 text-primary border-primary/25",
  degraded: "bg-primary/10 text-primary border-primary/25",
  medium: "bg-[var(--warning)]/15 text-[var(--warning-foreground)] border-[var(--warning)]/30",
  low: "bg-[var(--success)]/12 text-[var(--success)] border-[var(--success)]/25",
  covered: "bg-[var(--success)]/12 text-[var(--success)] border-[var(--success)]/25",
  healthy: "bg-[var(--success)]/12 text-[var(--success)] border-[var(--success)]/25",
  approved: "bg-[var(--success)]/12 text-[var(--success)] border-[var(--success)]/25",
  active: "bg-[var(--success)]/12 text-[var(--success)] border-[var(--success)]/25",
  none: "bg-muted text-muted-foreground border-border",
};

function renderCell(cell: string) {
  const tone = TONES[cell.toLowerCase()];
  if (!tone) return cell;
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>{cell}</span>;
}

export function AiInsightCard({
  detected,
  why,
  recommend,
  impact,
}: {
  detected: string;
  why: string;
  recommend: string;
  impact: string;
}) {
  const rows = [
    ["Detected", detected],
    ["Likely cause", why],
    ["Recommendation", recommend],
    ["Expected impact", impact],
  ];
  return (
    <Card className="gap-0 border-primary/25 bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/12 text-primary">
          <Brain className="h-4 w-4" />
        </span>
        <p className="font-display text-sm font-semibold">Nayera AI signal</p>
        <Badge variant="outline" className="ml-auto border-primary/30 text-[10px] text-primary">
          Needs review
        </Badge>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
