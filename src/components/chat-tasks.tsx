import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees as seededEmployees } from "@/data/workspace";
import { supabase } from "@/integrations/supabase/client";
import { useDataSource } from "@/lib/data-source";
import { fetchUploadedEmployees } from "@/lib/uploaded-data";

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
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

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

  const { data: people = [] } = useQuery({
    queryKey: ["task-assignees", source],
    queryFn: async () => {
      if (source === "uploaded") {
        const rows = await fetchUploadedEmployees();
        return rows.map((r) => ({ name: r.name, department: r.department }));
      }
      return seededEmployees.map((e) => ({ name: e.name, department: e.department }));
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

  const createTask = async () => {
    const person = people.find((p) => p.name === assignee);
    if (!title.trim() || !person) {
      toast.error("Enter a title and pick an employee.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("chat_tasks").insert({
      title: title.trim(),
      description: "",
      assignee_name: person.name,
      assignee_department: person.department,
      priority,
      due_date: dueDate || null,
      source_question: "Created manually",
      data_source: source,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Task assigned to ${person.name}.`);
    setTitle(""); setAssignee(""); setPriority("Medium"); setDueDate(""); setShowForm(false);
    void qc.invalidateQueries({ queryKey: ["chat-tasks"] });
  };

  return (
    <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-display text-sm font-semibold">Tasks created from Nayera AI chats</p>
          <p className="text-xs text-muted-foreground">Ask Nayera AI to create a task, or add one yourself.</p>
        </div>
        <Button size="sm" variant={showForm ? "outline" : "default"} className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5" />
          New task
        </Button>
      </div>

      {showForm && (
        <div className="grid gap-3 border-b border-border bg-muted/40 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="task-title" className="text-xs">Task</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Assign to</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger><SelectValue placeholder="Pick an employee" /></SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}{p.department ? ` — ${p.department}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-due" className="text-xs">Due date</Label>
            <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={createTask} disabled={saving || !title.trim() || !assignee} className="w-full sm:w-auto">
              {saving ? "Saving…" : "Assign task"}
            </Button>
          </div>
        </div>
      )}

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
