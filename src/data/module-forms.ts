// Per-module "Add manually" form definitions. Values are saved into module_records (title, employee, amount, status, details).
export type Field = { key: string; label: string; type: "text" | "number" | "date" | "select" | "textarea"; options?: string[]; required?: boolean };
export type ModuleForm = { titleLabel: string; titleOptions?: string[]; employee: boolean; employeeLabel?: string; amountLabel?: string; statuses: string[]; fields: Field[] };

const S = (...o: string[]) => o;
const DEFAULT: ModuleForm = { titleLabel: "Title", employee: true, amountLabel: "Amount", statuses: S("Open", "In progress", "Pending approval", "Approved", "Done"), fields: [{ key: "notes", label: "Details", type: "textarea" }] };

const F: Record<string, ModuleForm> = {
  leave: { titleLabel: "Leave type", titleOptions: S("Annual leave", "Sick leave", "Unpaid leave", "Maternity leave", "Paternity leave", "Emergency leave"), employee: true, amountLabel: "Days", statuses: S("Pending approval", "Approved", "Rejected", "Taken", "Cancelled"),
    fields: [{ key: "start", label: "Start date", type: "date", required: true }, { key: "end", label: "End date", type: "date", required: true }, { key: "reason", label: "Reason", type: "textarea" }] },
  attendance: { titleLabel: "Attendance event", titleOptions: S("Late arrival", "Absence", "Early leave", "Missed punch", "Overtime"), employee: true, amountLabel: "Hours", statuses: S("Open", "Justified", "Unjustified", "Resolved"),
    fields: [{ key: "date", label: "Date", type: "date", required: true }, { key: "note", label: "Note", type: "textarea" }] },
  shifts: { titleLabel: "Shift", titleOptions: S("Morning", "Evening", "Night", "Weekend"), employee: true, amountLabel: "Hours", statuses: S("Scheduled", "Swapped", "Completed", "Missed"),
    fields: [{ key: "date", label: "Date", type: "date", required: true }, { key: "location", label: "Location", type: "text" }] },
  payroll: { titleLabel: "Payroll item", titleOptions: S("Monthly salary", "Bonus", "Overtime pay", "Deduction", "Adjustment", "Off-cycle payment"), employee: true, amountLabel: "Amount", statuses: S("Draft", "Pending approval", "Approved", "Paid"),
    fields: [{ key: "period", label: "Pay period (month)", type: "text", required: true }, { key: "note", label: "Note", type: "textarea" }] },
  compensation: { titleLabel: "Change type", titleOptions: S("Salary increase", "Promotion adjustment", "Market adjustment", "Equity grant", "Allowance"), employee: true, amountLabel: "New salary / amount", statuses: S("Proposed", "Pending approval", "Approved", "Rejected"),
    fields: [{ key: "effective", label: "Effective date", type: "date", required: true }, { key: "justification", label: "Justification", type: "textarea", required: true }] },
  benefits: { titleLabel: "Benefit", titleOptions: S("Medical insurance", "Life insurance", "Transport allowance", "Meal allowance", "Gym", "Education support"), employee: true, amountLabel: "Monthly cost", statuses: S("Requested", "Active", "Suspended", "Ended"),
    fields: [{ key: "start", label: "Start date", type: "date" }, { key: "dependents", label: "Dependents", type: "number" }] },
  recruitment: { titleLabel: "Job title", employee: true, employeeLabel: "Hiring manager", amountLabel: "Budgeted salary", statuses: S("Draft", "Open", "Interviewing", "Offer", "Filled", "Closed"),
    fields: [{ key: "department", label: "Department", type: "text", required: true }, { key: "openings", label: "Openings", type: "number" }, { key: "location", label: "Location", type: "text" }, { key: "requirements", label: "Requirements", type: "textarea" }] },
  onboarding: { titleLabel: "New hire name", employee: true, employeeLabel: "Buddy / manager", statuses: S("Not started", "In progress", "Completed"),
    fields: [{ key: "start", label: "Start date", type: "date", required: true }, { key: "role", label: "Role", type: "text" }, { key: "checklist", label: "Checklist items", type: "textarea" }] },
  tasks: { titleLabel: "Task", employee: true, employeeLabel: "Assignee", statuses: S("Open", "In progress", "Done"),
    fields: [{ key: "due", label: "Due date", type: "date" }, { key: "priority", label: "Priority", type: "select", options: S("Low", "Medium", "High", "Critical") }, { key: "notes", label: "Description", type: "textarea" }] },
  projects: { titleLabel: "Project name", employee: true, employeeLabel: "Project lead", amountLabel: "Budget", statuses: S("Planned", "Active", "On hold", "Completed"),
    fields: [{ key: "start", label: "Start date", type: "date" }, { key: "end", label: "End date", type: "date" }, { key: "scope", label: "Scope", type: "textarea" }] },
  goals: { titleLabel: "Goal", employee: true, amountLabel: "Target %", statuses: S("Not started", "On track", "At risk", "Achieved"),
    fields: [{ key: "due", label: "Due date", type: "date" }, { key: "metric", label: "Success metric", type: "text", required: true }] },
  performance: { titleLabel: "Review", titleOptions: S("Annual review", "Mid-year review", "Probation review", "Improvement plan"), employee: true, amountLabel: "Rating (1-5)", statuses: S("Scheduled", "In progress", "Submitted", "Calibrated"),
    fields: [{ key: "reviewer", label: "Reviewer", type: "text" }, { key: "date", label: "Review date", type: "date" }, { key: "feedback", label: "Feedback", type: "textarea" }] },
  learning: { titleLabel: "Course", employee: true, amountLabel: "Cost", statuses: S("Assigned", "In progress", "Completed", "Overdue"),
    fields: [{ key: "provider", label: "Provider", type: "text" }, { key: "hours", label: "Hours", type: "number" }, { key: "due", label: "Due date", type: "date" }] },
  skills: { titleLabel: "Skill", employee: true, amountLabel: "Level (1-5)", statuses: S("Self-assessed", "Validated", "Gap"), fields: [{ key: "evidence", label: "Evidence", type: "textarea" }] },
  "career-paths": { titleLabel: "Target role", employee: true, statuses: S("Exploring", "In development", "Ready"),
    fields: [{ key: "timeline", label: "Timeline", type: "select", options: S("0-6 months", "6-12 months", "1-2 years") }, { key: "gaps", label: "Development gaps", type: "textarea" }] },
  "internal-mobility": { titleLabel: "Move type", titleOptions: S("Transfer", "Promotion", "Secondment", "Relocation"), employee: true, statuses: S("Requested", "Pending approval", "Approved", "Completed"),
    fields: [{ key: "to_role", label: "New role", type: "text", required: true }, { key: "to_dept", label: "New department", type: "text" }, { key: "effective", label: "Effective date", type: "date" }] },
  succession: { titleLabel: "Critical role", employee: true, employeeLabel: "Successor", statuses: S("Ready now", "Ready 1-2 years", "Not ready"),
    fields: [{ key: "incumbent", label: "Current holder", type: "text" }, { key: "plan", label: "Development plan", type: "textarea" }] },
  "workforce-planning": { titleLabel: "Position", employee: false, amountLabel: "Headcount", statuses: S("Proposed", "Approved", "Rejected"),
    fields: [{ key: "department", label: "Department", type: "text", required: true }, { key: "quarter", label: "Quarter", type: "select", options: S("Q1", "Q2", "Q3", "Q4") }, { key: "reason", label: "Business reason", type: "textarea" }] },
  "employee-relations": { titleLabel: "Case type", titleOptions: S("Grievance", "Disciplinary", "Investigation", "Conflict", "Policy breach"), employee: true, statuses: S("Open", "Investigating", "Resolved", "Closed"),
    fields: [{ key: "date", label: "Incident date", type: "date" }, { key: "severity", label: "Severity", type: "select", options: S("Low", "Medium", "High") }, { key: "summary", label: "Summary", type: "textarea", required: true }] },
  compliance: { titleLabel: "Compliance item", employee: true, employeeLabel: "Owner", statuses: S("Open", "Compliant", "Non-compliant", "Remediated"),
    fields: [{ key: "regulation", label: "Regulation / policy", type: "text" }, { key: "due", label: "Due date", type: "date" }] },
};

export const formFor = (slug: string): ModuleForm => F[slug] ?? DEFAULT;
