export type AgentDef = {
  id: string;
  name: string;
  module: string; // module slug
  approver: string;
  focus: string;
  starters: string[];
};

export const agents: AgentDef[] = [
  { id: "employee", name: "Employee Agent", module: "notifications", approver: "Line Manager", focus: "Employee self-service: leave, pay questions, documents, goals.", starters: ["Request 3 days of leave next week and arrange cover"] },
  { id: "manager", name: "Manager Agent", module: "projects", approver: "HR Business Partner", focus: "Team workload, capacity, staffing and delivery risk.", starters: ["Rebalance my team's workload for the next sprint"] },
  { id: "hr-ops", name: "HR Operations Agent", module: "administration", approver: "HR Director", focus: "HR operations, records, letters and policy execution.", starters: ["Clean up incomplete employee records"] },
  { id: "recruitment", name: "Recruitment Agent", module: "recruitment", approver: "CHRO", focus: "Requisitions, sourcing, shortlists, offers.", starters: ["Hire a Senior Data Analyst for my team", "Open a requisition for 2 Support agents"] },
  { id: "onboarding", name: "Onboarding Agent", module: "onboarding", approver: "HR Director", focus: "Pre-boarding, equipment, accounts, first-90-day plan.", starters: ["Onboard next Monday's new joiners"] },
  { id: "attendance", name: "Attendance Agent", module: "attendance", approver: "Line Manager", focus: "Absence patterns, lateness, overtime.", starters: ["Investigate this month's absence spike"] },
  { id: "shifts", name: "Shift Agent", module: "shifts", approver: "Operations Manager", focus: "Rosters, coverage and shift swaps.", starters: ["Fix next week's Support coverage gaps"] },
  { id: "leave", name: "Leave Agent", module: "leave", approver: "Line Manager", focus: "Leave balances, conflicts and coverage.", starters: ["Resolve overlapping leave requests in Support"] },
  { id: "payroll", name: "Payroll Agent", module: "payroll", approver: "CFO", focus: "Payroll runs, anomalies, leakage, release.", starters: ["Audit this payroll run before close", "Explain the rise in overtime pay"] },
  { id: "compensation", name: "Compensation Agent", module: "compensation", approver: "CHRO", focus: "Salary bands, equity, adjustments.", starters: ["Find employees paid below their band"] },
  { id: "benefits", name: "Benefits Agent", module: "benefits", approver: "HR Director", focus: "Benefit enrollment, cost and usage.", starters: ["Review benefit cost growth this year"] },
  { id: "performance", name: "Performance Agent", module: "performance", approver: "HR Business Partner", focus: "Reviews, calibration, underperformance.", starters: ["Prepare calibration for this review cycle"] },
  { id: "goal", name: "Goal Agent", module: "goals", approver: "Line Manager", focus: "OKRs, goal progress and alignment.", starters: ["Flag goals at risk this quarter"] },
  { id: "learning", name: "Learning Agent", module: "learning", approver: "L&D Lead", focus: "Training plans and completion.", starters: ["Build a training plan for skill gaps in Support"] },
  { id: "skills", name: "Skills Agent", module: "skills", approver: "L&D Lead", focus: "Skills inventory and gaps.", starters: ["Map critical skill gaps for next year"] },
  { id: "career", name: "Career Agent", module: "career-paths", approver: "HR Business Partner", focus: "Career paths and readiness.", starters: ["Build career paths for high performers"] },
  { id: "talent", name: "Talent Agent", module: "internal-mobility", approver: "HR Business Partner", focus: "Internal mobility and redeployment.", starters: ["Find internal candidates for open roles"] },
  { id: "succession", name: "Succession Agent", module: "succession", approver: "CHRO", focus: "Critical roles, successors, readiness.", starters: ["Identify successors for the Support Team Lead role"] },
  { id: "workforce", name: "Workforce Agent", module: "workforce-planning", approver: "CFO", focus: "Headcount, capacity, redeploy vs hire.", starters: ["Reduce Support overtime by 20% this quarter"] },
  { id: "hrbp", name: "HRBP Agent", module: "organization", approver: "CHRO", focus: "Org health and department partnering.", starters: ["Prepare an org health review for Support"] },
  { id: "employee-relations", name: "Employee Relations Agent", module: "employee-relations", approver: "HR Director", focus: "Cases, grievances, investigations.", starters: ["Triage open employee relations cases"] },
  { id: "compliance", name: "Compliance Agent", module: "compliance", approver: "Legal Counsel", focus: "Labour law, contracts, audits.", starters: ["Check expiring contracts and permits"] },
  { id: "chro", name: "CHRO Agent", module: "executive", approver: "CEO", focus: "Workforce strategy, risk and talent.", starters: ["Prepare the monthly people risk briefing"] },
  { id: "cfo", name: "CFO Workforce Agent", module: "analytics", approver: "CEO", focus: "People cost, payroll and headcount budget.", starters: ["Forecast people cost for next quarter"] },
  { id: "ceo", name: "CEO People Agent", module: "reports", approver: "Board", focus: "People-to-profit impact.", starters: ["Summarise people impact on revenue this quarter"] },
];

export const agentById = Object.fromEntries(agents.map((a) => [a.id, a]));

const extra: Record<string, string> = {
  tasks: "manager", attendance: "attendance", "workflow-builder": "hr-ops", integrations: "hr-ops",
  "ai-audit": "compliance", "ai-agents": "chro",
};
export function agentForModule(slug: string): AgentDef | undefined {
  return agents.find((a) => a.module === slug) ?? agentById[extra[slug] ?? ""];
}

export const RUN_STATUS_LABEL: Record<string, string> = {
  planning: "Planning", running: "Running", waiting_approval: "Waiting for approval", paused: "Paused",
  blocked: "Blocked", completed: "Completed", failed: "Failed", cancelled: "Cancelled", reporting: "Writing result",
};
