import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Brain } from "lucide-react";

import { PageHeader } from "@/components/page-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeeById, type Employee } from "@/data/workspace";

export const Route = createFileRoute("/employees/$employeeId")({
  loader: ({ params }) => {
    const employee = employeeById[params.employeeId];
    if (!employee) throw notFound();
    return { employee };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Employee not found — Brite AI" }, { name: "robots", content: "noindex" }] };
    }
    const { employee } = loaderData;
    const description = `${employee.name}, ${employee.title} in ${employee.department}. Utilization, goals, skills and AI insights.`;
    return {
      meta: [
        { title: `${employee.name} — Employee 360 — Brite AI` },
        { name: "description", content: description },
        { property: "og:title", content: `${employee.name} — Employee 360` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Employee360,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="font-display text-xl font-semibold">Employee not found</h1>
      <Button asChild className="mt-4">
        <Link to="/employees">Back to employees</Link>
      </Button>
    </div>
  ),
});

const TABS = [
  "Overview",
  "Attendance",
  "Leave",
  "Payroll",
  "Performance",
  "Goals",
  "Skills",
  "Learning",
  "Projects",
  "Career",
  "Documents",
  "Benefits",
  "Feedback",
  "History",
  "AI Insights",
];

function Employee360() {
  const { employee } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Employee 360"
        title={employee.name}
        subtitle={`${employee.title} · ${employee.department} · ${employee.location}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Start review
            </Button>
            <Button size="sm">Take action</Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Utilization" value={`${employee.utilization}%`} bar={employee.utilization} />
        <Stat label="Goal achievement" value={`${employee.goalAchievement}%`} bar={employee.goalAchievement} />
        <Field label="Manager" value={employee.manager} />
        <Field label="AI flag" value={employee.riskFlag} highlight />
      </div>

      <Tabs defaultValue="Overview">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)] lg:col-span-2">
              <h3 className="mb-3 font-display text-sm font-semibold">Master data</h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["Employee ID", employee.id.toUpperCase()],
                    ["Job title", employee.title],
                    ["Department", employee.department],
                    ["Location", employee.location],
                    ["Grade", employee.grade],
                    ["Employment type", employee.type],
                    ["Joining date", employee.joined],
                    ["Status", employee.status],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="text-sm text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <SkillsCard employee={employee} />
          </div>
        </TabsContent>

        <TabsContent value="AI Insights" className="mt-4">
          <AiSummary employee={employee} />
        </TabsContent>

        <TabsContent value="Skills" className="mt-4">
          <SkillsCard employee={employee} />
        </TabsContent>

        {TABS.filter((t) => !["Overview", "AI Insights", "Skills"].includes(t)).map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-display text-sm font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t} records for {employee.name} appear here once the {t.toLowerCase()} module is connected to live data.
              </p>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AiSummary employee={employee} />
    </div>
  );
}

function AiSummary({ employee }: { employee: Employee }) {
  return (
    <Card className="gap-0 border-primary/25 bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/12 text-primary">
          <Brain className="h-4 w-4" />
        </span>
        <p className="font-display text-sm font-semibold">Brite AI employee summary</p>
      </div>
      <p className="text-sm text-foreground">{employee.summary}</p>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        AI recommended actions
      </p>
      <ul className="mt-1 space-y-1">
        {employee.actions.map((a) => (
          <li key={a} className="flex gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {a}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SkillsCard({ employee }: { employee: Employee }) {
  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-2 font-display text-sm font-semibold">Skill profile</h3>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Strengths</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {employee.strengths.map((s) => (
          <Badge key={s} variant="outline" className="border-[var(--success)]/30 text-[var(--success)]">
            {s}
          </Badge>
        ))}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Development areas</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {employee.development.map((s) => (
          <Badge key={s} variant="outline" className="border-primary/30 text-primary">
            {s}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function Stat({ label, value, bar }: { label: string; value: string; bar: number }) {
  return (
    <Card className="gap-0 p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <Progress value={Math.min(bar, 100)} className="mt-2 h-1.5" />
    </Card>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card className="gap-0 p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </Card>
  );
}
