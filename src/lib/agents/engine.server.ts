import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { agentById, agents } from "@/data/agents";
import { roles } from "@/data/workspace";
import { publicClient, uploadedSnapshot, workspaceSnapshot } from "@/lib/chat.server";
import { createLovableAiGatewayRunIdFetch } from "@/lib/run-id.ts";

const MODEL = "openai/gpt-6-astra";
const TOOLS = ["analyze", "search_employees", "compute_metric", "draft_document", "create_task", "request_approval", "note"];
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
  if (source === "uploaded") return (await uploadedSnapshot()).text;
  return workspaceSnapshot();
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
  const data = await dataFor(input.dataSource);
  const agentList = agents.map((a) => `${a.id}: ${a.name} — ${a.focus}`).join("\n");
  const fixed = input.agent ? agentById[input.agent] : undefined;

  const plan = await aiJson<{ agent: string; summary: string; steps: { title: string; tool: string; detail: string }[] }>(
    `You are the Nayera agent planner inside an HR ERP. Return ONLY JSON: {"agent": string, "summary": string, "steps": [{"title": string, "tool": string, "detail": string}]}.
Pick the agent id ${fixed ? `"${fixed.id}" (fixed)` : "best suited from the list"}. Write 4 to 8 concrete, executable steps that complete the business process end to end.
Allowed tools: analyze (reason over company data), search_employees (find people), compute_metric (calculate a figure), draft_document (write a JD, letter, plan, memo), create_task (assign follow-up work to a real employee), request_approval (human sign-off), note (record a finding).
Any salary, hiring, offer, promotion, termination, payroll release, contract or headcount action MUST be preceded by a request_approval step. Only reference employees in the data.

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
    const risk = tool === "request_approval" ? "high" : tool === "create_task" || SENSITIVE.test(s.title) ? "medium" : "low";
    return { run_id: run.id, idx: i + 1, title: s.title, tool, risk, input: { detail: s.detail ?? "" } };
  });
  const ins = await db().from("agent_steps").insert(rows);
  if (ins.error) throw ins.error;
  await event(run.id, "info", `Run started by ${role.title}. ${agentById[agentId]!.name} planned ${rows.length} steps.`);
  return { id: run.id as string };
}

export async function advanceRun(runId: string) {
  const { data: run } = await db().from("agent_runs").select("*").eq("id", runId).single();
  if (!run || run.status !== "running") return { status: run?.status ?? "missing" };

  const { data: steps } = await db().from("agent_steps").select("*").eq("run_id", runId).order("idx");
  const all = steps ?? [];
  const step = all.find((s) => s.status === "pending");
  if (!step) return finalizeRun(runId);

  const agent = agentById[run.agent]!;

  if (step.tool === "request_approval") {
    const previous = all.filter((s) => s.status === "done").map((s) => `${s.title}: ${s.output?.result ?? ""}`).join("\n");
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
    await event(runId, "approval", `Waiting for ${agent.approver} approval: ${step.title}`, step.id);
    return { status: "waiting_approval" };
  }

  await db().from("agent_steps").update({ status: "running", started_at: new Date().toISOString(), attempts: step.attempts + 1 }).eq("id", step.id);
  await event(runId, "step", `Step ${step.idx} started: ${step.title}`, step.id);

  const previous = all.filter((s) => s.status === "done").map((s) => `Step ${s.idx} ${s.title}: ${s.output?.result ?? ""}`).join("\n");
  try {
    const data = await dataFor(run.data_source);
    const out = await aiJson<{ ok: boolean; result: string; evidence: string; blocker?: string; task?: { title: string; description: string; assignee_name: string; assignee_department: string; priority: string; due_date: string } }>(
      `You are ${agent.name} in the Nayera HR ERP (${agent.focus}). Execute ONE step using only the company data. Return ONLY JSON:
{"ok": boolean, "result": string (markdown, concise, with figures), "evidence": string (which data you used), "blocker": string (only if ok=false: what is missing and who must provide it)${step.tool === "create_task" ? `, "task": {"title","description","assignee_name" (exact existing employee),"assignee_department","priority" (Low|Medium|High|Critical),"due_date" (YYYY-MM-DD, today ${new Date().toISOString().slice(0, 10)})}` : ""}}
Set ok=false rather than inventing data. Never claim an external action (email, posting) happened.

COMPANY DATA
${data}`,
      `Objective: ${run.objective}\nTool: ${step.tool}\nStep ${step.idx}: ${step.title}. ${step.input?.detail ?? ""}${step.input?.human_note ? `\nHuman instruction: ${step.input.human_note}` : ""}\nPrevious results:\n${previous || "none"}`,
    );

    let valid = out.ok && typeof out.result === "string" && out.result.trim().length > 10;
    let result = out.result;
    if (valid && step.tool === "create_task") {
      const t = out.task;
      if (!t?.assignee_name || !t.title) valid = false;
      else {
        const { error } = await db().from("chat_tasks").insert({
          title: t.title, description: t.description ?? "", assignee_name: t.assignee_name, assignee_department: t.assignee_department ?? "",
          priority: ["Low", "Medium", "High", "Critical"].includes(t.priority) ? t.priority : "Medium",
          due_date: /^\d{4}-\d{2}-\d{2}$/.test(t.due_date ?? "") ? t.due_date : null,
          source_question: `Agent run: ${run.objective}`.slice(0, 500), created_by_role: run.requested_by_role, data_source: run.data_source, run_id: runId,
        });
        if (error) valid = false; else result += `\n\nTask created for **${t.assignee_name}** (${t.priority}, due ${t.due_date}).`;
      }
    }

    if (valid) {
      await db().from("agent_steps").update({ status: "done", output: { result }, evidence: out.evidence ?? "", error: "", finished_at: new Date().toISOString() }).eq("id", step.id);
      await event(runId, "done", `Step ${step.idx} validated: ${step.title}`, step.id);
      await updateProgress(runId);
      return { status: "running" };
    }
    const reason = out.blocker || "Result failed validation.";
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

async function block(runId: string, stepId: string, reason: string) {
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
  const lines = (steps ?? []).map((s) => `${s.idx}. [${s.status}] ${s.title}: ${s.output?.result ?? s.error ?? ""}`).join("\n");
  const decisions = (appr ?? []).map((a) => `${a.approver_role} ${a.status}: ${a.reason}${a.note ? ` (note: ${a.note})` : ""}`).join("\n");
  try {
    const report = await aiJson<Record<string, unknown>>(
      `Write the final agent execution report. Return ONLY JSON {"objective": string, "completed": string[], "not_completed": string[], "decisions": string[], "issues": string[], "result": string, "impact": string, "recommendations": string[]}. Only state what the step log proves.`,
      `Objective: ${run.objective}\nSteps:\n${lines}\nHuman decisions:\n${decisions || "none"}`,
    );
    await db().from("agent_runs").update({ status: "completed", progress: 100, report, blocker: "" }).eq("id", runId);
    await event(runId, "done", "Run completed and final report generated");
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
