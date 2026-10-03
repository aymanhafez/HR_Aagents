import { AgentPanel } from "@/components/agents/agent-panel";
import { AiInsightCard, DataTable, KpiGrid, PageHeader } from "@/components/page-parts";
import { Button } from "@/components/ui/button";
import { moduleBySlug } from "@/data/modules";
import { ModuleRecords } from "@/components/module-records";
import { useState } from "react";

export function ModulePage({ slug }: { slug: string }) {
  const mod = moduleBySlug[slug];
  const [openSignal, setOpenSignal] = useState(0);
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
            <Button size="sm" onClick={() => setOpenSignal((n) => n + 1)}>New record</Button>
          </div>
        }
      />
      <KpiGrid kpis={mod.kpis} />
      <AiInsightCard {...mod.ai} />
      <AgentPanel slug={slug} />
      <ModuleRecords slug={slug} label={mod.title} openSignal={openSignal} />
      <DataTable columns={mod.columns} rows={mod.rows} />
    </div>
  );
}
