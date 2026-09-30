import { supabase } from "@/integrations/supabase/client";

export type UploadedEmployee = {
  id: string;
  name: string;
  title: string;
  department: string;
  location: string;
  manager: string;
  grade: string;
  employment_type: string;
  joined: string;
  status: string;
  salary: number | null;
  utilization: number | null;
  goal_achievement: number | null;
  risk_flag: string;
  extra: Record<string, unknown>;
};

export async function fetchUploadedEmployees(): Promise<UploadedEmployee[]> {
  const { data, error } = await supabase
    .from("uploaded_employees")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as unknown as UploadedEmployee[];
}

const ALIASES: Record<string, string[]> = {
  name: ["name", "full name", "employee", "employee name"],
  title: ["title", "job title", "position", "role"],
  department: ["department", "dept", "team"],
  location: ["location", "city", "office", "country"],
  manager: ["manager", "line manager", "reports to"],
  grade: ["grade", "level", "band"],
  employment_type: ["type", "employment type", "contract"],
  joined: ["joined", "hire date", "start date", "joining date"],
  status: ["status"],
  salary: ["salary", "base salary", "pay", "annual salary"],
  utilization: ["utilization", "utilisation", "workload"],
  goal_achievement: ["goals", "goal achievement", "performance", "rating"],
  risk_flag: ["risk", "risk flag", "flag"],
};

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export function mapRow(row: Record<string, string>) {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) lower[k.trim().toLowerCase()] = String(v ?? "").trim();
  const used = new Set<string>();
  const pick = (field: string) => {
    for (const a of ALIASES[field]!) if (a in lower) { used.add(a); return lower[a]!; }
    return "";
  };
  const out = {
    name: pick("name"),
    title: pick("title"),
    department: pick("department"),
    location: pick("location"),
    manager: pick("manager"),
    grade: pick("grade"),
    employment_type: pick("employment_type"),
    joined: pick("joined"),
    status: pick("status") || "Active",
    salary: num(pick("salary")),
    utilization: num(pick("utilization")),
    goal_achievement: num(pick("goal_achievement")),
    risk_flag: pick("risk_flag"),
    extra: {} as Record<string, string>,
  };
  for (const [k, v] of Object.entries(lower)) if (!used.has(k) && v) out.extra[k] = v;
  return out;
}
