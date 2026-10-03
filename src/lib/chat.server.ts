import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";

import { modules } from "@/data/modules";
import { approvals, employees, recommendations, roles } from "@/data/workspace";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

function workspaceSnapshot() {
  const moduleLines = modules
    .map(
      (m) =>
        `${m.title}: ${m.kpis.map((k) => `${k.label} ${k.value}`).join("; ")}. AI signal — detected: ${m.ai.detected} cause: ${m.ai.why} recommendation: ${m.ai.recommend} impact: ${m.ai.impact}`,
    )
    .join("\n");

  const recLines = recommendations
    .map(
      (r) =>
        `${r.id} [${r.severity}/${r.category}] ${r.title} (${r.department}). Problem: ${r.problem} Evidence: ${r.evidence.join(" | ")} Cause: ${r.cause} Financial: ${r.financial} Operational: ${r.operational} Recommendation: ${r.recommendation} Alternatives: ${r.alternatives.join(" | ")} Confidence: ${r.confidence}% Owner: ${r.owner} Approval: ${r.approval}`,
    )
    .join("\n");

  const empLines = employees
    .map(
      (e) =>
        `${e.name} — ${e.title}, ${e.department}, ${e.location}, manager ${e.manager}, grade ${e.grade}, joined ${e.joined}. Utilization ${e.utilization}%, goals ${e.goalAchievement}%, flag: ${e.riskFlag}. Strengths: ${e.strengths.join(", ")}. Development: ${e.development.join(", ")}. Summary: ${e.summary}`,
    )
    .join("\n");

  const apprLines = approvals
    .map((a) => `${a.id} ${a.type} — ${a.subject}, requested by ${a.requestedBy}, ${a.amount}, ${a.age} old, risk ${a.risk}`)
    .join("\n");

  return `MODULE SIGNALS\n${moduleLines}\n\nAI RECOMMENDATIONS\n${recLines}\n\nEMPLOYEES\n${empLines}\n\nPENDING APPROVALS\n${apprLines}`;
}

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  return sb;
}

async function uploadedSnapshot() {
  const sb = publicClient();
  const { data, error } = await sb.from("uploaded_employees").select("*").limit(3000);
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return { count: 0, text: "No employee data has been uploaded yet." };
  const byDept: Record<string, number> = {};
  for (const r of rows) byDept[r.department || "Unassigned"] = (byDept[r.department || "Unassigned"] ?? 0) + 1;
  const lines = rows.map((r) =>
    [r.name, r.title, r.department, r.location, r.manager && `mgr ${r.manager}`, r.grade, r.employment_type, r.joined && `joined ${r.joined}`, r.status,
      r.salary != null && `salary ${r.salary}`, r.utilization != null && `util ${r.utilization}%`, r.goal_achievement != null && `goals ${r.goal_achievement}%`,
      r.risk_flag && `flag ${r.risk_flag}`, Object.keys(r.extra ?? {}).length ? JSON.stringify(r.extra) : ""]
      .filter(Boolean).join(" | "),
  );
  return {
    count: rows.length,
    text: `HEADCOUNT ${rows.length}\nBY DEPARTMENT: ${Object.entries(byDept).map(([d, n]) => `${d} ${n}`).join("; ")}\n\nEMPLOYEES\n${lines.join("\n")}`,
  };
}

function uploadedPrompt(roleId: string | undefined, context: string | undefined, snap: { count: number; text: string }) {
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!;
  return `You are Nayera AI, the people-intelligence assistant inside an HR ERP platform.

You are speaking with a user in the ${role.title} role (focus: ${role.focus}), viewing "${context ?? "/"}".

The company's own uploaded employee data is below (${snap.count} records). Answer ONLY from this data. Do not use or mention any sample company, and never invent employees, figures or policies. If something needed (payroll runs, attendance, approvals) is not in the upload, say it is missing and what column or file would provide it.

Work as Detect, Understand, Predict, Recommend, Compare, then state what needs human approval. Lead with the direct answer, back it with figures computed from the data, offer an alternative when proposing an action, and name who must approve sensitive actions. Short markdown, bullets over paragraphs.

UPLOADED DATA
${snap.text}`;
}

function systemPrompt(roleId?: string, context?: string) {
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!;
  return `You are Nayera AI, the people-intelligence assistant inside an HR ERP platform.

You are speaking with ${role.name}, whose role is ${role.title}. Their focus: ${role.focus}. They are currently viewing the screen at "${context ?? "/"}".

Answer using the workspace data below. It is demo data for a company of 1,284 employees; treat it as the real system of record and never mention that it is sample data.

Work the way the platform works — Detect, Understand, Predict, Recommend, Compare, then state what needs human approval:
- Lead with the direct answer in one or two sentences.
- Back it with specific figures from the data.
- When you propose an action, give at least one alternative with cost, time and risk.
- Sensitive actions (salary change, promotion, hiring, termination, disciplinary action, payroll approval, contract change, headcount) always require named human approval — say who must approve.
- Be explicit about uncertainty and what data you used.
- Keep it tight: short markdown, bullets over paragraphs, no filler. Never invent employees, amounts or policies that are not in the data; say what is missing instead.

WORKSPACE DATA
${workspaceSnapshot()}`;
}

export async function handleChat(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI is not configured." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const body = (await request.json()) as {
    messages?: UIMessage[];
    roleId?: string;
    context?: string;
    dataSource?: string;
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  let system = systemPrompt(body.roleId, body.context);
  if (body.dataSource === "uploaded") {
    try {
      system = uploadedPrompt(body.roleId, body.context, await uploadedSnapshot());
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: "Could not load your uploaded data." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  }

  system += `

TASKS
You can create follow-up tasks with the create_task tool. Use it when the user asks for a task, action item or follow-up, or asks you to assign work. Base the task on what was discussed in this conversation: a clear action title, a description with the relevant figures and context, a realistic due date (today is ${new Date().toISOString().slice(0, 10)}), and a priority. Assign it only to an employee who exists in the data above, using their exact name; if the right person is unclear, ask. After creating it, confirm in one line who it was assigned to and when it is due.`;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const sourceQuestion = lastUser?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 500) ?? "";

  const tools = {
    create_task: tool({
      description: "Create a follow-up task assigned to one employee, based on the current conversation.",
      inputSchema: z.object({
        title: z.string().describe("Short action title"),
        description: z.string().describe("What to do and why, with figures from the conversation"),
        assignee_name: z.string().describe("Exact employee name from the data"),
        assignee_department: z.string().describe("Employee department, or empty string"),
        priority: z.enum(["Low", "Medium", "High", "Critical"]),
        due_date: z.string().describe("Due date YYYY-MM-DD"),
      }),
      execute: async (input) => {
        const { data, error } = await publicClient()
          .from("chat_tasks")
          .insert({
            ...input,
            due_date: /^\d{4}-\d{2}-\d{2}$/.test(input.due_date) ? input.due_date : null,
            source_question: sourceQuestion,
            created_by_role: body.roleId ?? "",
            data_source: body.dataSource === "uploaded" ? "uploaded" : "seeded",
          })
          .select("id")
          .single();
        if (error) return { ok: false as const, error: error.message };
        return { ok: true as const, id: data.id, ...input };
      },
    }),
  };

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    system,
    tools,
    stopWhen: stepCountIs(4),
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: false }),
    runIdFetch,
  );
}
