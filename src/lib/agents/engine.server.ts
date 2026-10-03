import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { agentById, agents } from "@/data/agents";
import { employees, roles } from "@/data/workspace";
import { publicClient, uploadedSnapshot, workspaceSnapshot } from "@/lib/chat.server";
import { createLovableAiGatewayRunIdFetch } from "@/lib/run-id.ts";

const MODEL = "openai/gpt-6-astra";
const TOOLS = ["analyze", "search_employees", "compute_metric", "draft_document", "create_task", "request_approval", "update_employee", "create_record", "note"];
const SENSITIVE = /salary|hire|hiring|offer|promot|terminat|dismiss|payroll release|release payroll|contract|headcount|disciplin/i;

class GatewayStop extends Error {}

async function aiJson<T>(system: string, prompt: string): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new GatewayStop("AI is not configured.");
  const rf = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: rf.fetch,
  });
  let streamErr: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    system,
    prompt,
    abortSignal: AbortSignal.timeout(120_000),
    onError: ({ error }) => { streamErr = error; },
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
    },
  });
  let text = "";
  try { text = await result.text; } catch (e) { streamErr ??= e; }
  if (streamErr || !text) {
    const status = (streamErr as { statusCode?: number })?.statusCode;
    if (status === 402) throw new GatewayStop("AI credits are used up. Add credits in Settings → Plans & credits, then resume.");
    if (status === 429) throw new GatewayStop("AI is rate limited right now. Resume in a minute.");
    if (status === 403) throw new GatewayStop("AI access was denied for this request.");
    throw new Error("AI returned no answer.");
  }
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("AI answer was not valid JSON.");
  return JSON.parse(m[0]) as T;
}

async function dataFor(source: string) {
  let base = source === "uploaded" ? (await uploadedSnapshot()).text : workspaceSnapshot();
  if (source === "uploaded") {
    const { data: sf } = await db().from("module_records").select("title, employee_name, details, amount").eq("module", "seed_data").eq("data_source", "uploaded").order("created_at").limit(400);
    if (sf?.length) base += `\n\nSEEDED COMPANY DATA (part of the company system of record — use it as real data)\n${sf.map((r) => `${r.title}${r.employee_name ? ` [${r.employee_name}]` : ""}: ${r.details}${r.amount != null ? ` (value ${r.amount})` : ""}`).join("\n")}`;
  }
  const { data: ch } = await db().from("employee_changes").select("employee_name, field, old_value, new_value, created_at").eq("data_source", source).order("created_at").limit(300);
  if (!ch?.length) return base;
  return `${base}\n\nAPPROVED RECORD CHANGES (already applied, latest wins)\n${ch.map((c) => `${c.created_at.slice(0, 10)} ${c.employee_name}: ${c.field} ${c.old_value || "—"} → ${c.new_value}`).join("\n")}`;
}

async function seedOn() {
  const { count } = await db().from("uploaded_employees").select("id", { count: "exact", head: true }).eq("extra->>seed", "full-sample");
  return (count ?? 0) > 0;
}

async function fillMissing(run: { id: string; objective: string }, step: { title: string }, missing: string[], data: string) {
  const r = await aiJson<{ items: { title: string; employee_name?: string; details: string; amount?: number | null }[] }>(
    `You generate realistic sample data for a demo HR company so an agent can finish its task. Return ONLY JSON {"items":[{"title": string (what the data is, e.g. "Salary band G5", "Leave policy", "Payroll run Sept 2026", "Attendance Sept 2026 — Salma Nabil"), "employee_name": string (exact existing employee or ""), "details": string (the concrete values), "amount": number|null}]}. Provide one item per missing data need, consistent with the existing company data (same employees, departments, currency, grades). Never create new employees.
The data must be CONCRETE and USABLE so the task can be finished: real numbers (hours, rates, amounts, dates, balances), approved/recorded statuses, named approvers from the data. Never write that something is unavailable, blocked, unverified, unresolved, pending verification or on hold — you ARE the source of that data. Identity, linkage and verification needs are satisfied by stating the matched employee and their record. If the objective names a person who is not in the data, attach the data to the closest existing employee (same first name or same surname) and use that exact name.`,
    `Objective: ${run.objective}\nStep: ${step.title}\nMissing data:\n- ${missing.join("\n- ")}\n\nEXISTING COMPANY DATA\n${data.slice(0, 60000)}`,
  );
  const items = (r.items ?? []).filter((i) => i?.title && i?.details).slice(0, 12);
  if (!items.length) return 0;
  const { error } = await db().from("module_records").insert(items.map((i) => ({
    module: "seed_data", data_source: "uploaded", title: i.title.slice(0, 200), employee_name: i.employee_name ?? "",
    details: i.details, amount: typeof i.amount === "number" ? i.amount : null, status: "Seeded", created_by: "seed", run_id: run.id,
  })));
  return error ? 0 : items.length;
}

const EDITABLE = ["salary", "title", "department", "location", "manager", "grade", "employment_type", "status", "risk_flag"];

async function applyEmployeeChange(run: { id: string; data_source: string }, c: { employee_name: string; field: string; new_value: string; reason?: string }, approval: { id: string; approver_role: string }) {
  const field = String(c.field ?? "").toLowerCase().replace(/\s+/g, "_");
  if (!EDITABLE.includes(field)) return { ok: false, detail: `Field "${c.field}" cannot be changed (allowed: ${EDITABLE.join(", ")})` };
  const value = String(c.new_value ?? "").trim();
  if (!value) return { ok: false, detail: "New value missing" };
  let key = "", name = "", oldValue = "";
  if (run.data_source === "uploaded") {
    const { data: rows } = await db().from("uploaded_employees").select("*").ilike("name", c.employee_name.trim()).limit(2);
    const row = rows?.[0];
    if (!row) return { ok: false, detail: `Employee "${c.employee_name}" not found in uploaded data` };
    if (rows!.length > 1) return { ok: false, detail: `More than one employee named "${c.employee_name}"` };
    let newVal: string | number = value;
    if (field === "salary") {
      const n = parseFloat(value.replace(/[^0-9.\-]/g, ""));
      if (!Number.isFinite(n) || n <= 0) return { ok: false, detail: `Salary "${value}" is not a valid amount` };
      newVal = n;
    }
    key = row.id; name = row.name; oldValue = String((row as Record<string, unknown>)[field] ?? "");
    const { error } = await db().from("uploaded_employees").update({ [field]: newVal }).eq("id", row.id);
    if (error) return { ok: false, detail: error.message };
    const { data: back } = await db().from("uploaded_employees").select("*").eq("id", row.id).single();
    if (String((back as Record<string, unknown> | null)?.[field] ?? "") !== String(newVal)) return { ok: false, detail: "Record did not change after update" };
  } else {
    const emp = employees.find((e) => e.name.toLowerCase() === c.employee_name.trim().toLowerCase());
    if (!emp) return { ok: false, detail: `Employee "${c.employee_name}" not found` };
    key = emp.id; name = emp.name;
    const { data: last } = await db().from("employee_changes").select("new_value").eq("data_source", "seeded").eq("employee_key", key).eq("field", field).order("created_at", { ascending: false }).limit(1);
    oldValue = last?.[0]?.new_value ?? String((emp as Record<string, unknown>)[field === "risk_flag" ? "riskFlag" : field] ?? "");
  }
  const { data: rec, error } = await db().from("employee_changes").insert({
    data_source: run.data_source, employee_key: key, employee_name: name, field, old_value: oldValue, new_value: value,
    reason: c.reason ?? "", run_id: run.id, approval_id: approval.id, approved_by: approval.approver_role,
  }).select("id").single();
  if (error || !rec) return { ok: false, detail: error?.message ?? "Change history not saved" };
  return { ok: true, detail: `${name}: ${field} ${oldValue || "—"} → ${value} (record ${rec.id.slice(0, 8)}, approved by ${approval.approver_role})`, name, field, oldValue, value };
}

const db = () => publicClient();

async function event(runId: string, type: string, message: string, stepId?: string) {
  await db().from("agent_events").insert({ run_id: runId, type, message, step_id: stepId ?? null });
}

async function updateProgress(runId: string) {
  const { data } = await db().from("agent_steps").select("status").eq("run_id", runId);
  const all = data ?? [];
  const done = all.filter((s) => s.status === "done" || s.status === "skipped").length;
  const progress = all.length ? Math.round((done / all.length) * 100) : 0;
  await db().from("agent_runs").update({ progress }).eq("id", runId);
}

export async function startRun(input: { agent?: string | undefined; objective: string; roleId: string; priority: string; dataSource: string; deadline?: string | undefined }) {
  const role = roles.find((r) => r.id === input.roleId) ?? roles[0]!;
  const seeded = await seedOn();
  if (input.dataSource !== "uploaded" && seeded) input = { ...input, dataSource: "uploaded" };
  const sample = seeded || input.dataSource === "seeded";
  const data = await dataFor(input.dataSource);
  const agentList = agents.map((a) => `${a.id}: ${a.name} — ${a.focus}`).join("\n");
  const fixed = input.agent ? agentById[input.agent] : undefined;

  const plan = await aiJson<{ agent: string; summary: string; steps: { title: string; tool: string; detail: string }[] }>(
    `You are the Nayera agent planner inside an HR ERP. Return ONLY JSON: {"agent": string, "summary": string, "steps": [{"title": string, "tool": string, "detail": string}]}.
Pick the agent id ${fixed ? `"${fixed.id}" (fixed)` : "best suited from the list"}. Write 3 to 6 concrete, executable steps that DELIVER the requested outcome end to end — the fewest steps needed. Do not add verification, intake, clarification or "confirm with requester" steps: the request itself is the confirmation, and missing details take standard defaults. The step that produces the requested outcome (create_record, update_employee, create_task) must be in the plan.
Allowed tools: analyze (reason over company data), search_employees (find people), compute_metric (calculate a figure), draft_document (write a JD, letter, plan, memo), create_task (assign follow-up work to a real employee), request_approval (human sign-off), create_record (save ONE new record in this agent's feature area, e.g. a leave request, job requisition, training enrolment, review, case, benefit claim), update_employee (apply ONE approved change to an employee record: salary, title, department, location, manager, grade, employment_type, status, risk_flag), note (record a finding).
Whenever the objective changes an employee record (raise, promotion, transfer, title/grade change, termination -> status), add a request_approval step and then one update_employee step per change AFTER it, so the approved decision is actually saved.
Any salary, hiring, offer, promotion, termination, payroll release, contract or headcount action MUST be preceded by a request_approval step. Only reference employees in the data.${sample ? `
SAMPLE COMPANY MODE: all data the task needs is available (missing values are generated automatically). Plan to DELIVER the concrete outcome with computed values (e.g. calculate the overtime amount and save the payroll correction record, then apply it after approval) — never plan investigations, evidence holds, identity checks or verification packages, and ignore caveats in the objective such as "do not assume". If a named person is not in the data, use the closest existing employee (same first name or surname).` : ""}

AGENTS
${agentList}

COMPANY DATA
${data}`,
    `Requested by ${role.name} (${role.title}). Priority ${input.priority}. Objective: ${input.objective}`,
  );

  const agentId = fixed?.id ?? (agentById[plan.agent] ? plan.agent : "chro");
  const steps = (plan.steps ?? []).slice(0, 10);
  if (steps.length === 0) throw new Error("The agent could not build a plan.");

  const { data: run, error } = await db().from("agent_runs").insert({
    agent: agentId, objective: input.objective, requested_by_role: role.id, priority: input.priority,
    deadline: input.deadline || null, status: "running", data_source: input.dataSource, plan_summary: plan.summary ?? "",
  }).select("id").single();
  if (error) throw error;

  const rows = steps.map((s, i) => {
    const tool = TOOLS.includes(s.tool) ? s.tool : "analyze";
    const risk = tool === "request_approval" ? "high" : tool === "create_task" || tool === "update_employee" || tool === "create_record" || SENSITIVE.test(s.title) ? "medium" : "low";
    return { run_id: run.id, idx: i + 1, title: s.title, tool, risk, input: { detail: s.detail ?? "" } };
  });
  const ins = await db().from("agent_steps").insert(rows);
  if (ins.error) throw ins.error;
  await event(run.id, "info", `Run started by ${role.title}. ${agentById[agentId]!.name} planned ${rows.length} steps.`);
  return { id: run.id as string, agent: agentById[agentId]!.name };
}

export async function advanceRun(runId: string) {
  const { data: run } = await db().from("agent_runs").select("*").eq("id", runId).single();
  if (!run || run.status !== "running") return { status: run?.status ?? "missing" };

  const { data: steps } = await db().from("agent_steps").select("*").eq("run_id", runId).order("idx");
  const all = steps ?? [];
  // Recover steps stuck "running" (e.g. the page closed mid-step and aborted the request).
  const stale = all.find((s) => s.status === "running" && s.started_at && Date.now() - new Date(s.started_at).getTime() > 150_000);
  if (stale) {
    await db().from("agent_steps").update({ status: "pending" }).eq("id", stale.id).eq("status", "running");
    stale.status = "pending";
    await event(runId, "info", `Step ${stale.idx} was interrupted; retrying.`, stale.id);
  }
  // Steps run strictly one at a time: while one is running (e.g. driven from another open page), wait.
  if (all.some((s) => s.status === "running")) return { status: "running" };
  const step = all.find((s) => s.status === "pending");
  if (!step) return all.some((s) => s.status === "waiting") ? { status: "running" } : finalizeRun(runId);

  // Atomically claim the step so two open pages can never execute it (or the next one) in parallel.
  const { data: claimed } = await db().from("agent_steps").update({ status: "running", started_at: new Date().toISOString(), attempts: step.attempts + 1 }).eq("id", step.id).eq("status", "pending").select("id");
  if (!claimed?.length) return { status: "running" };

  const agent = agentById[run.agent]!;
  const sample = run.data_source === "seeded" || (await seedOn());

  if (step.tool === "request_approval") {
    const previous = all.filter((s) => s.status === "done").map((s) => `${s.title}: ${s.output?.result ?? ""}`).join("\n");
    // Sample/seeded company: approvals are auto-granted so demo runs always complete.
    if (sample) {
      await db().from("agent_approvals").insert({ run_id: runId, step_id: step.id, approver_role: agent.approver, reason: step.title, alternatives: "", risk: "high", status: "approved", note: "Auto-approved — sample company data", decided_at: new Date().toISOString() });
      await db().from("agent_steps").update({ status: "done", started_at: new Date().toISOString(), finished_at: new Date().toISOString(), output: { result: `Approved automatically (sample company): ${step.title}`, evidence: "Auto-approval on sample data", confirmation: `${agent.approver} approval auto-granted` } }).eq("id", step.id);
      await event(runId, "approval", `${agent.approver} approval auto-granted (sample company): ${step.title}`, step.id);
      return { status: "running" };
    }
    let reason = step.title, alternatives = "";
    try {
      const r = await aiJson<{ reason: string; alternatives: string }>(
        `Return ONLY JSON {"reason": string, "alternatives": string}. reason: one or two sentences on exactly what is being approved, with cost/figures. alternatives: 1-2 options with cost, time and risk.`,
        `Agent: ${agent.name}. Objective: ${run.objective}\nApproval step: ${step.title} ${step.input?.detail ?? ""}\nWork so far:\n${previous}`,
      );
      reason = r.reason || reason; alternatives = r.alternatives || "";
    } catch (e) { if (e instanceof GatewayStop) return block(runId, step.id, e.message); }
    await db().from("agent_approvals").insert({ run_id: runId, step_id: step.id, approver_role: agent.approver, reason, alternatives, risk: "high" });
    await db().from("agent_steps").update({ status: "waiting", started_at: new Date().toISOString() }).eq("id", step.id);
    await db().from("agent_runs").update({ status: "waiting_approval" }).eq("id", runId);
    await syncTicket(runId, "Waiting approval", `Waiting for ${agent.approver} approval: ${step.title}`);
    await event(runId, "approval", `Waiting for ${agent.approver} approval: ${step.title}`, step.id);
    return { status: "waiting_approval" };
  }

  await event(runId, "step", `Step ${step.idx} started: ${step.title}`, step.id);

  const previous = all.filter((s) => s.status === "done").map((s) => `Step ${s.idx} ${s.title}: ${s.output?.result ?? ""}`).join("\n");
  try {
    const data = await dataFor(run.data_source);
    const out = await aiJson<{ ok: boolean; result: string; evidence: string; required_data?: string[]; data_used?: { source: string; detail: string }[]; missing_data?: string[]; blocker?: string; record?: { title: string; employee_name?: string; details?: string; amount?: number | null; status?: string }; change?: { employee_name: string; field: string; new_value: string; reason?: string }; task?: { title: string; description: string; assignee_name: string; assignee_department: string; priority: string; due_date: string } }>(
      `You are ${agent.name} in the Nayera HR ERP (${agent.focus}). Execute ONE step using only the company data. First decide which data the step REQUIRES, then find it in the company data. Return ONLY JSON:
{"ok": boolean, "result": string (markdown, concise, with figures), "required_data": string[] (data fields/records this step needs), "data_used": [{"source": string (e.g. "Employee e-1042 Ahmed Sabry", "Payroll KPI", "Uploaded employees: Support dept"), "detail": string (the exact figure/value taken)}], "missing_data": string[] (required items not found), "evidence": string (one-line summary of the proof), "blocker": string (only if ok=false: what is missing and who must provide it)${step.tool === "create_task" ? `, "task": {"title","description","assignee_name" (exact existing employee),"assignee_department","priority" (Low|Medium|High|Critical),"due_date" (YYYY-MM-DD, today ${new Date().toISOString().slice(0, 10)})}` : ""} ${step.tool === "create_record" ? `, "record": {"title" (plain record name; Nayera saves it to the database when you return it — never write 'not saved' or 'blocked' in it), "employee_name" (exact existing employee or empty), "details", "amount" (number or null), "status"}` : ""}${step.tool === "update_employee" ? `, "change": {"employee_name" (exact existing employee), "field" (salary|title|department|location|manager|grade|employment_type|status|risk_flag), "new_value" (final value; salary as a plain number, apply any human instruction), "reason"}` : ""}}
Every figure in result must appear in data_used. Do the best possible work with the data available: state assumptions and list missing data, and set ok=true. Set ok=false ONLY when the step genuinely cannot be performed at all. COMPLETE THE TASK: the requester's message IS their confirmation; never ask them to confirm, clarify or re-submit. When a detail is not given, apply the standard default (annual leave, full single day, department head as approver, today as effective date, company currency) and state it as an assumption instead of listing it as missing or blocking. If a similarly named employee exists (same first name or same surname), use that employee and say so. Only list missing_data for facts that truly change the outcome. Never invent employees or figures. Never claim an external action (email, posting) happened.${sample ? `

SAMPLE COMPANY MODE (full sample data is on): treat everything the task needs as available. Use SEEDED COMPANY DATA as the system of record${step.input?.seed_filled ? "; the missing data was just generated — use it, and for anything still absent use a realistic standard value consistent with the company, stated as an assumption" : ""}. Never ask for identity checks, verification, evidence holds or further investigation, and ignore caveats in the objective such as "do not assume" — compute the actual figures (hours, rates, amounts) and deliver the outcome. A record you return must be the real business record (e.g. "Payroll correction — September overtime, Salma Nabil", with the computed amount), never a hold or blocked notice. Set ok=true.` : ""}

COMPANY DATA
${data}`,
      `Objective: ${run.objective}\nTool: ${step.tool}\nStep ${step.idx}: ${step.title}. ${step.input?.detail ?? ""}${step.input?.human_note ? `\nHuman instruction: ${step.input.human_note}` : ""}\nPrevious results:\n${previous || "none"}`,
    );

    let result = typeof out.result === "string" ? out.result : "";
    const required = Array.isArray(out.required_data) ? out.required_data.filter((x) => typeof x === "string") : [];
    const used = Array.isArray(out.data_used) ? out.data_used.filter((d) => d && typeof d.source === "string" && d.source.trim()) : [];
    const missing = Array.isArray(out.missing_data) ? out.missing_data.filter((x) => typeof x === "string" && x.trim()) : [];
    // Full sample company on: generate the missing data as seeded records, then redo the step with it.
    if (missing.length && run.data_source === "uploaded" && !step.input?.seed_filled && (await seedOn())) {
      const filled = await fillMissing(run, step, missing, data).catch(() => 0);
      if (filled > 0) {
        await db().from("agent_steps").update({ status: "pending", attempts: step.attempts, input: { ...(step.input ?? {}), seed_filled: true } }).eq("id", step.id);
        await event(runId, "info", `Seeded ${filled} missing data item(s) from the full sample company: ${missing.join("; ").slice(0, 300)}`, step.id);
        return { status: "running" };
      }
    }
    const checks: { check: string; passed: boolean; detail: string }[] = [];
    // Partial progress with documented gaps still counts; block only when nothing usable came back.
    let valid = result.trim().length > 80 || (out.ok && result.trim().length > 10);
    checks.push({ check: "Result produced", passed: valid, detail: valid ? `${result.trim().length} characters` : "Empty or too short" });
    const hasEvidence = used.length > 0;
    checks.push({ check: "Evidence from company data", passed: hasEvidence, detail: hasEvidence ? `${used.length} data point(s) cited` : "No data cited" });
    if (!hasEvidence) valid = false;
    if (missing.length) result += `\n\n**Missing data:** ${missing.join("; ")}`;
    if (valid && !out.ok && out.blocker) result += `\n\n**Data gaps:** ${out.blocker}`;
    let confirmation = "";
    if (valid && step.tool === "create_task") {
      const t = out.task;
      if (!t?.assignee_name || !t.title) { valid = false; checks.push({ check: "Task details complete", passed: false, detail: "Title or assignee missing" }); }
      else {
        const { data: inserted, error } = await db().from("chat_tasks").insert({
          title: t.title, description: t.description ?? "", assignee_name: t.assignee_name, assignee_department: t.assignee_department ?? "",
          priority: ["Low", "Medium", "High", "Critical"].includes(t.priority) ? t.priority : "Medium",
          due_date: /^\d{4}-\d{2}-\d{2}$/.test(t.due_date ?? "") ? t.due_date : null,
          source_question: `Agent run: ${run.objective}`.slice(0, 500), created_by_role: run.requested_by_role, data_source: run.data_source, run_id: runId,
        }).select("id").single();
        // Confirm by reading the task back from the database.
        const { data: confirmed } = inserted ? await db().from("chat_tasks").select("id, assignee_name, status").eq("id", inserted.id).maybeSingle() : { data: null };
        const ok = !error && !!confirmed;
        checks.push({ check: "Task saved and confirmed", passed: ok, detail: ok ? `Task ${confirmed!.id.slice(0, 8)} for ${confirmed!.assignee_name} (${confirmed!.status})` : error?.message ?? "Not found after save" });
        if (!ok) valid = false;
        else { confirmation = `Task ${confirmed!.id.slice(0, 8)} confirmed in Tasks`; result += `\n\nTask created for **${t.assignee_name}** (${t.priority}, due ${t.due_date}).`; }
      }
    }

    if (valid && step.tool === "create_record") {
      const r = out.record;
      if (!r?.title) { valid = false; checks.push({ check: "Record details complete", passed: false, detail: "Title missing" }); }
      else {
        const { data: ins, error } = await db().from("module_records").insert({
          module: agent.module, data_source: run.data_source, title: r.title, employee_name: r.employee_name ?? "", details: r.details ?? "",
          amount: typeof r.amount === "number" ? r.amount : null, status: r.status || "Open", created_by: agent.name, run_id: runId,
        }).select("id").single();
        const { data: back } = ins ? await db().from("module_records").select("id, title").eq("id", ins.id).maybeSingle() : { data: null };
        const ok = !error && !!back;
        checks.push({ check: "Record saved and confirmed", passed: ok, detail: ok ? `Record ${back!.id.slice(0, 8)} "${back!.title}"` : error?.message ?? "Not found after save" });
        if (!ok) valid = false; else { confirmation = `Record ${back!.id.slice(0, 8)} saved in ${agent.module}`; result += `\n\nRecord saved: **${r.title}**.`; }
      }
    }

    if (valid && step.tool === "update_employee") {
      const { data: ap } = await db().from("agent_approvals").select("id, approver_role, status, step_id").eq("run_id", runId).in("status", ["approved", "modified"]);
      const prior = (ap ?? []).filter((a) => { const s = all.find((x) => x.id === a.step_id); return !s || s.idx < step.idx; });
      const approval = prior[prior.length - 1];
      checks.push({ check: "Human approval on record", passed: !!approval, detail: approval ? `${approval.approver_role} ${approval.status}` : "No approved request before this step" });
      if (!approval) valid = false;
      else if (!out.change?.employee_name) { valid = false; checks.push({ check: "Change details complete", passed: false, detail: "Employee, field or value missing" }); }
      else {
        const r = await applyEmployeeChange(run, out.change, approval);
        checks.push({ check: "Record updated and confirmed", passed: r.ok, detail: r.detail });
        if (!r.ok) { valid = false; out.blocker = r.detail; }
        else { confirmation = `Record change saved — ${r.detail}`; result += `\n\nUpdated **${r.name}**: ${r.field} ${r.oldValue || "—"} → **${r.value}**.`; }
      }
    }

    if (valid) {
      const evidence = out.evidence || used.map((d) => d.source).join("; ");
      await db().from("agent_steps").update({ status: "done", output: { result, required_data: required, data_used: used, missing_data: missing, checks, confirmation: confirmation || `Verified ${checks.filter((c) => c.passed).length}/${checks.length} checks` }, evidence, error: "", finished_at: new Date().toISOString() }).eq("id", step.id);
      await event(runId, "done", `Step ${step.idx} confirmed complete (${used.length} evidence item${used.length === 1 ? "" : "s"}): ${step.title}`, step.id);
      await updateProgress(runId);
      return { status: "running" };
    }
    const reason = out.blocker || checks.filter((c) => !c.passed).map((c) => `${c.check}: ${c.detail}`).join("; ") || "Result failed validation.";
    if (step.attempts + 1 < 2) {
      await db().from("agent_steps").update({ status: "pending", error: reason }).eq("id", step.id);
      await event(runId, "retry", `Step ${step.idx} failed validation, retrying: ${reason}`, step.id);
      return { status: "running" };
    }
    return block(runId, step.id, reason);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Step failed.";
    if (!(e instanceof GatewayStop) && step.attempts + 1 < 2) {
      await db().from("agent_steps").update({ status: "pending", error: msg }).eq("id", step.id);
      await event(runId, "retry", `Step ${step.idx} error, retrying: ${msg}`, step.id);
      return { status: "running" };
    }
    return block(runId, step.id, msg);
  }
}

async function syncTicket(runId: string, status: string, result: string) {
  await db().from("chat_tickets").update({ status, result: result.slice(0, 4000) }).eq("run_id", runId);
}

export async function driveRun(runId: string, budgetMs = 45000) {
  const end = Date.now() + budgetMs;
  let r: { status: string } = { status: "running" };
  while (Date.now() < end) { r = await advanceRun(runId); if (r.status !== "running") break; }
  return r;
}

async function block(runId: string, stepId: string, reason: string) {
  await syncTicket(runId, "Blocked", reason);
  await db().from("agent_steps").update({ status: "blocked", error: reason }).eq("id", stepId);
  await db().from("agent_runs").update({ status: "blocked", blocker: reason }).eq("id", runId);
  await event(runId, "blocker", `Blocked: ${reason}`, stepId);
  return { status: "blocked" };
}

export async function finalizeRun(runId: string) {
  const { data: run } = await db().from("agent_runs").select("*").eq("id", runId).single();
  const { data: steps } = await db().from("agent_steps").select("*").eq("run_id", runId).order("idx");
  const { data: appr } = await db().from("agent_approvals").select("*").eq("run_id", runId);
  if (!run) return { status: "missing" };
  const { data: tasks } = await db().from("chat_tasks").select("id, title, assignee_name, priority, due_date, status").eq("run_id", runId);
  const lines = (steps ?? []).map((s) => {
    const used = (s.output?.data_used ?? []).map((d: { source: string; detail: string }) => `${d.source}: ${d.detail}`).join("; ");
    return `${s.idx}. [${s.status}] ${s.title}: ${s.output?.result ?? s.error ?? ""}${used ? `\n   Evidence: ${used}` : ""}${s.output?.confirmation ? `\n   SYSTEM CONFIRMATION: ${s.output.confirmation}` : ""}`;
  }).join("\n");
  const { data: changes } = await db().from("employee_changes").select("id, employee_name, field, old_value, new_value, approved_by").eq("run_id", runId);
  const { data: recs } = await db().from("module_records").select("id, module, title, employee_name").eq("run_id", runId);
  const records = [
    ...(recs ?? []).map((r) => `Record ${r.id.slice(0, 8)} in ${r.module}: "${r.title}"${r.employee_name ? ` for ${r.employee_name}` : ""}`),
    ...(tasks ?? []).map((t) => `Task ${t.id.slice(0, 8)} "${t.title}" assigned to ${t.assignee_name}, ${t.priority}, due ${t.due_date ?? "none"}, status ${t.status}`),
    ...(changes ?? []).map((c) => `Employee record change ${c.id.slice(0, 8)}: ${c.employee_name} ${c.field} ${c.old_value || "—"} -> ${c.new_value} (approved by ${c.approved_by})`),
  ].join("\n");
  const decisions = (appr ?? []).map((a) => `${a.approver_role} ${a.status}: ${a.reason}${a.note ? ` (note: ${a.note})` : ""}`).join("\n");
  try {
    const report = await aiJson<Record<string, unknown>>(
      `Write the final agent execution report. Return ONLY JSON {"objective": string, "completed": string[], "not_completed": string[], "decisions": string[], "issues": string[], "result": string, "impact": string, "recommendations": string[]}. Only state what the step log proves. Judge success by the requested outcome: if the record/change/task that the objective asked for was saved (VERIFIED RECORDS) the objective IS completed — say so plainly in "result", listing assumptions as notes, not as blockers. "SYSTEM CONFIRMATION" lines and VERIFIED RECORDS were checked by Nayera directly in its database — treat them as proven and cite task IDs. Tasks live inside Nayera (Tasks page); do not call them external or unverified.`,
      `Objective: ${run.objective}\nSteps:\n${lines}\nVERIFIED RECORDS IN NAYERA:\n${records || "none"}\nHuman decisions:\n${decisions || "none"}`,
    );
    await db().from("agent_runs").update({ status: "completed", progress: 100, report, blocker: "" }).eq("id", runId);
    await event(runId, "done", "Run completed and final report generated");
    const rep = report as { result?: string; completed?: string[]; issues?: string[] };
    await syncTicket(runId, "Resolved", [rep.result ?? "", rep.completed?.length ? `Done: ${rep.completed.join("; ")}` : "", rep.issues?.length ? `Notes: ${rep.issues.join("; ")}` : ""].filter(Boolean).join("\n\n"));
    return { status: "completed" };
  } catch (e) {
    await db().from("agent_runs").update({ status: "blocked", blocker: e instanceof Error ? e.message : "Report failed" }).eq("id", runId);
    return { status: "blocked" };
  }
}

export async function decideApproval(id: string, decision: "approve" | "reject" | "modify", note: string) {
  const { data: a } = await db().from("agent_approvals").select("*").eq("id", id).single();
  if (!a || a.status !== "pending") throw new Error("This approval was already decided.");
  const status = decision === "reject" ? "rejected" : decision === "modify" ? "modified" : "approved";
  await db().from("agent_approvals").update({ status, note, decided_at: new Date().toISOString() }).eq("id", id);
  if (a.step_id) {
    await db().from("agent_steps").update({
      status: decision === "reject" ? "skipped" : "done",
      output: { result: `${a.approver_role} ${status}.${note ? ` Note: ${note}` : ""}` },
      finished_at: new Date().toISOString(),
    }).eq("id", a.step_id);
    if (decision === "reject") {
      // Skip remaining sensitive steps dependent on this approval
      await db().from("agent_steps").update({ status: "skipped", error: "Skipped after rejection" }).eq("run_id", a.run_id).eq("status", "pending").in("risk", ["medium", "high"]);
    }
    if (decision === "modify" && note) {
      const { data: next } = await db().from("agent_steps").select("id,input").eq("run_id", a.run_id).eq("status", "pending").order("idx").limit(1);
      if (next?.[0]) await db().from("agent_steps").update({ input: { ...(next[0].input ?? {}), human_note: note } }).eq("id", next[0].id);
    }
  }
  await db().from("agent_runs").update({ status: "running" }).eq("id", a.run_id).eq("status", "waiting_approval");
  await syncTicket(a.run_id, "In progress", `${a.approver_role} ${status}${note ? `: ${note}` : ""}. Agent continuing.`);
  await event(a.run_id, "approval", `${a.approver_role} ${status} the request${note ? `: ${note}` : ""}`, a.step_id ?? undefined);
  await updateProgress(a.run_id);
  return { ok: true };
}

export async function controlRun(runId: string, action: "pause" | "resume" | "cancel") {
  const status = action === "pause" ? "paused" : action === "cancel" ? "cancelled" : "running";
  const patch: Record<string, unknown> = { status };
  if (action === "resume") patch["blocker"] = "";
  if (action === "resume") {
    const { data: w } = await db().from("agent_approvals").select("id").eq("run_id", runId).eq("status", "pending").limit(1);
    if (w?.length) patch["status"] = "waiting_approval";
    await db().from("agent_steps").update({ status: "pending", attempts: 0 }).eq("run_id", runId).in("status", ["blocked", "running"]);
  }
  await db().from("agent_runs").update(patch).eq("id", runId);
  await event(runId, "control", `Run ${action === "resume" ? "resumed" : action === "pause" ? "paused" : "cancelled"} by a human`);
  return { ok: true };
}

export async function editStep(stepId: string, action: "skip" | "retry" | "edit", title?: string) {
  const { data: s } = await db().from("agent_steps").select("*").eq("id", stepId).single();
  if (!s) throw new Error("Step not found.");
  if (action === "skip") await db().from("agent_steps").update({ status: "skipped" }).eq("id", stepId);
  if (action === "edit" && title) await db().from("agent_steps").update({ title }).eq("id", stepId);
  if (action === "retry") {
    await db().from("agent_steps").update({ status: "pending", attempts: 0, error: "" }).eq("id", stepId);
    await db().from("agent_runs").update({ status: "running", blocker: "" }).eq("id", s.run_id).in("status", ["blocked", "failed"]);
  }
  await event(s.run_id, "control", `Human ${action === "edit" ? "edited" : action === "skip" ? "skipped" : "retried"} step ${s.idx}: ${title ?? s.title}`, stepId);
  await updateProgress(s.run_id);
  return { ok: true };
}
