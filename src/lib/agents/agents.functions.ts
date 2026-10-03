import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { advanceRun, controlRun, decideApproval, editStep, startRun } from "./engine.server";

export const startAgentRun = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    agent: z.string().optional(), objective: z.string().min(3).max(1000), roleId: z.string(),
    priority: z.string(), dataSource: z.string(), deadline: z.string().optional(),
  }).parse(d))
  .handler(({ data }) => startRun(data));

export const advanceAgentRun = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(({ data }) => advanceRun(data.runId));

export const decideAgentApproval = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), decision: z.enum(["approve", "reject", "modify"]), note: z.string().max(1000) }).parse(d))
  .handler(({ data }) => decideApproval(data.id, data.decision, data.note));

export const controlAgentRun = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ runId: z.string().uuid(), action: z.enum(["pause", "resume", "cancel"]) }).parse(d))
  .handler(({ data }) => controlRun(data.runId, data.action));

export const editAgentStep = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ stepId: z.string().uuid(), action: z.enum(["skip", "retry", "edit"]), title: z.string().max(300).optional() }).parse(d))
  .handler(({ data }) => editStep(data.stepId, data.action, data.title));
