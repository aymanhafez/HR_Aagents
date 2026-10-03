# Working Agents Across the Platform (Phase 1)

Turn Nayera from "ask and get an answer" into agents that take a request, write a step-by-step plan, carry it out, stop for human approval when needed, and finish with a report. Everyone can follow every step as it happens.

## What you will see

1. **Agent Operations Center** (replaces the current AI Agents page)
   - A board of runs grouped by status: Planning, Running, Waiting for approval, Blocked, Completed, Failed.
   - A "Start agent" box: type a request such as "Hire a Senior Data Analyst for my team". Nayera picks the right agent, or you choose one.
   - Summary numbers: active runs, waiting approvals, hours saved, success rate.

2. **Agent Run page** (opens when you click a run)
   - The objective, the agent, who asked for it, priority and deadline.
   - The step plan with a status for each step (pending, running, done, waiting, failed, skipped) and an overall progress bar.
   - A live activity feed showing each step as it runs, plus the result and evidence it relied on.
   - Controls: Pause, Resume, Cancel, edit or skip a pending step, retry a failed step.
   - Approval card: Approve, Reject or Modify, with the agent's reasoning, risk level and alternatives.
   - Blocker card: what stopped the agent and who needs to act.
   - Final report: objective, what was done, what was not done, human decisions, issues, result, impact and next recommendations.

3. **Agents on every module page**
   - Each of the 30 module pages gets a "Run [Module] Agent" panel showing its recent runs and one-click starter tasks. For example, Payroll offers "Audit this payroll run" and Recruitment offers "Open a requisition".

4. **Approval Center and Tasks**
   - Agent approvals show up in the Approval Center next to the existing ones.
   - Tasks an agent creates appear on the Tasks page and link back to the run.

5. **Chat hand-off**
   - In the Nayera AI chat, "Run this as an agent" turns the conversation into a tracked run.

## Agents in this phase
There will be 24 agents (Employee, Manager, HR Ops, Recruitment, Onboarding, Attendance, Leave, Payroll, Compensation, Benefits, Performance, Goal, Learning, Skills, Career, Talent, Succession, Workforce, HRBP, Employee Relations, Compliance, CHRO, CFO Workforce and CEO People). They share one engine. Each agent has its own instructions and its own list of allowed tools. Recruitment, Payroll, Workforce, Onboarding and Compliance also get detailed example processes. Some demo runs will be preloaded so the board isn't empty on day one.

## Human control rules
- Anything sensitive must be approved by a named person before the agent goes on: salary, hiring, promotion, termination, payroll release, contract changes and headcount.
- A step only counts as done after a check confirms it. Otherwise it is marked failed or blocked.
- No sign-in, like the rest of the app. Anyone with the link can start runs and approve them. This is fine for a demo but would need sign-in for real use.

## Not in this phase
Scheduled or recurring agents, parent and child agents with dependency graphs, the ROI dashboard and live connections to outside systems. Agent actions only write inside Nayera (tasks, approvals, notes, reports). They don't post jobs or send emails.

---

## Technical details

**Database (one migration, with grants and open RLS to match the current no-auth setup):**
- `agent_runs`: id, agent, objective, requested_by_role, priority, deadline, status, progress, data_source, plan_summary, report (jsonb), created_at and updated_at.
- `agent_steps`: run_id, idx, title, tool, risk (low/medium/high), status, input/output (jsonb), evidence, error, attempts, started_at and finished_at.
- `agent_approvals`: run_id, step_id, approver_role, reason, risk, alternatives, status and decided_at.
- `agent_events`: run_id, step_id, type and message, used for the live feed.
- Realtime is turned on for runs, steps and events.
- `chat_tasks` gets a new `run_id` column.

**Engine (`src/lib/agents/*.server.ts`, called through server functions in `agents.functions.ts`):**
- `planRun`: uses `streamText` with `openai/gpt-6-astra` and structured output (a small schema) to produce the ordered steps, each with a tool and a risk level.
- `advanceRun`: runs steps one at a time. It calls the tool, saves the output and evidence, then validates the result. A high-risk tool creates an approval and sets the run to `waiting_approval`. Safe failures are retried up to 2 times, then the step is marked blocked. Each call handles a few steps, and the client calls it again so the request never times out. Pause, resume and cancel are flags that are checked before every step.
- `decideApproval`, `editStep`, `retryStep` and `finalizeRun` (`finalizeRun` writes the report using the AI).
- Tool registry (`tools.server.ts`), with read tools for the workspace and uploaded data plus write tools: create_task, create_approval, draft_document, note, compute_metric. Each tool has a risk level and the list of agents allowed to use it.
- Agent registry (`src/data/agents.ts`), holding each agent's prompt, tools, linked module and starter tasks.

**UI:** `/ai-agents` is rebuilt as the Operations Center. A new `/agents/$runId` route shows a run. There is a shared `AgentPanel` on `ModulePage`. Agent approvals are merged into `approval-center.tsx`. The chat gets a hand-off button. Live updates come from Supabase realtime subscriptions combined with TanStack Query.

**Gateway:** Every call streams and has the required Responses options. A 402 or 429 error pauses the run with a clear blocker message and does not retry.

**AGENTS.md:** Add a rule that agent execution runs in steps on the server and the database is the single source of truth.
