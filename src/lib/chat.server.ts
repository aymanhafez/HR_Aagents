import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

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

function systemPrompt(roleId?: string, context?: string) {
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!;
  return `You are Brite AI, the people-intelligence assistant inside an HR ERP platform.

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
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    system: systemPrompt(body.roleId, body.context),
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
