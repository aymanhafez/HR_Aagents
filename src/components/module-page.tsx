import { AgentPanel } from "@/components/agents/agent-panel";
import { AiInsightCard, DataTable, KpiGrid, PageHeader } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { moduleBySlug } from "@/data/modules";

export function ModulePage({ slug }: { slug: string }) {
  const mod = moduleBySlug[slug];
  if (!mod) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow={mod.group}
        title={mod.title}
        subtitle={mod.subtitle}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">New record</Button>
          </div>
        }
      />
      <KpiGrid kpis={mod.kpis} />
      <AiInsightCard {...mod.ai} />
      <AgentPanel slug={slug} />
      <DataTable columns={mod.columns} rows={mod.rows} />
    </div>
  );
}
