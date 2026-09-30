import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useDataSource } from "@/lib/data-source";

type ChatTask = {
  id: string;
  title: string;
  description: string;
  assignee_name: string;
  assignee_department: string;
  priority: string;
  due_date: string | null;
  status: string;
  source_question: string;
  created_at: string;
};

export function ChatTasks() {
  const { source } = useDataSource();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["chat-tasks", source],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_tasks")
        .select("*")
        .eq("data_source", source)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ChatTask[];
    },
  });

  const toggle = async (t: ChatTask) => {
    const { error } = await supabase
      .from("chat_tasks")
      .update({ status: t.status === "Done" ? "Open" : "Done" })
      .eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    void qc.invalidateQueries({ queryKey: ["chat-tasks"] });
  };

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
      <div className="border-b border-border px-4 py-3">
        <p className="font-display text-sm font-semibold">Tasks created from Brite AI chats</p>
        <p className="text-xs text-muted-foreground">Ask Brite AI to create a task, or use "Create task from this chat".</p>
      </div>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
      ) : data.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">No chat tasks yet.</p>
      ) : (
        <ul>
          {data.map((t) => (
            <li key={t.id} className="flex items-start gap-4 border-b border-border/70 px-4 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${t.status === "Done" ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                {t.source_question && (
                  <p className="mt-1 text-[11px] italic text-muted-foreground">From chat: “{t.source_question}”</p>
                )}
              </div>
              <div className="shrink-0 text-right text-xs">
                <p className="font-medium">{t.assignee_name}</p>
                <p className="text-muted-foreground">{t.assignee_department}</p>
                <p className="mt-1 text-muted-foreground">Due {t.due_date ?? "—"}</p>
              </div>
              <Badge variant="outline" className="shrink-0 border-primary/30 text-[11px] text-primary">{t.priority}</Badge>
              <Button size="sm" variant={t.status === "Done" ? "outline" : "default"} onClick={() => toggle(t)}>
                {t.status === "Done" ? "Reopen" : "Mark done"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
