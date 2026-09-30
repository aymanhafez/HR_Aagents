export type NavItem = { label: string; to: string; icon: string };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Intelligence",
    items: [
      { label: "AI Command Center", to: "/", icon: "Radar" },
      { label: "Executive Dashboard", to: "/executive", icon: "LayoutDashboard" },
      { label: "Workforce Planning", to: "/workforce-planning", icon: "LineChart" },
      { label: "Analytics", to: "/analytics", icon: "BarChart3" },
      { label: "Reports", to: "/reports", icon: "FileText" },
    ],
  },
  {
    label: "Core HR",
    items: [
      { label: "Organization", to: "/organization", icon: "Network" },
      { label: "Employees", to: "/employees", icon: "Users" },
      { label: "Employee 360", to: "/employees/e-1042", icon: "IdCard" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Attendance", to: "/attendance", icon: "Clock" },
      { label: "Shifts", to: "/shifts", icon: "CalendarClock" },
      { label: "Leave", to: "/leave", icon: "Plane" },
    ],
  },
  {
    label: "Pay & Rewards",
    items: [
      { label: "Payroll", to: "/payroll", icon: "Banknote" },
      { label: "Compensation", to: "/compensation", icon: "Scale" },
      { label: "Benefits", to: "/benefits", icon: "HeartPulse" },
    ],
  },
  {
    label: "Talent Acquisition",
    items: [
      { label: "Recruitment", to: "/recruitment", icon: "UserSearch" },
      { label: "Onboarding", to: "/onboarding", icon: "UserPlus" },
    ],
  },
  {
    label: "Execution",
    items: [
      { label: "Tasks", to: "/tasks", icon: "ListChecks" },
      { label: "Projects", to: "/projects", icon: "FolderKanban" },
      { label: "Goals", to: "/goals", icon: "Target" },
      { label: "Performance", to: "/performance", icon: "Gauge" },
    ],
  },
  {
    label: "Talent",
    items: [
      { label: "Learning", to: "/learning", icon: "GraduationCap" },
      { label: "Skills", to: "/skills", icon: "Puzzle" },
      { label: "Career Paths", to: "/career-paths", icon: "Route" },
      { label: "Internal Mobility", to: "/internal-mobility", icon: "ArrowLeftRight" },
      { label: "Succession", to: "/succession", icon: "Crown" },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Employee Relations", to: "/employee-relations", icon: "Handshake" },
      { label: "Compliance", to: "/compliance", icon: "ShieldCheck" },
      { label: "AI Audit", to: "/ai-audit", icon: "ScrollText" },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "AI Agents", to: "/ai-agents", icon: "Bot" },
      { label: "Workflow Builder", to: "/workflow-builder", icon: "Workflow" },
      { label: "Approval Center", to: "/approval-center", icon: "Stamp" },
      { label: "Notifications", to: "/notifications", icon: "Bell" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Data Sources", to: "/data-sources", icon: "Database" },
      { label: "Integrations", to: "/integrations", icon: "Plug" },
      { label: "Administration", to: "/administration", icon: "Settings" },
    ],
  },
];

export type Role = {
  id: string;
  title: string;
  name: string;
  focus: string;
};

export const roles: Role[] = [
  { id: "chro", title: "CHRO", name: "Salma Meyer", focus: "Workforce risk, talent, cost" },
  { id: "ceo", title: "CEO", name: "Adrian Cole", focus: "People-to-profit impact" },
  { id: "cfo", title: "CFO", name: "Rina Kaur", focus: "Cost, headcount, payroll" },
  { id: "manager", title: "Line Manager", name: "Layla Haddad", focus: "Team workload and capacity" },
  { id: "employee", title: "Employee", name: "Ahmed Sabry", focus: "Leave, pay, goals, growth" },
];

export type Recommendation = {
  id: string;
  title: string;
  department: string;
  severity: "Critical" | "High" | "Medium";
  category: "Risk" | "Cost saving" | "Growth";
  problem: string;
  evidence: string[];
  cause: string;
  affected: string;
  financial: string;
  operational: string;
  recommendation: string;
  alternatives: string[];
  confidence: number;
  owner: string;
  approval: string;
};

export const recommendations: Recommendation[] = [
  {
    id: "REC-1041",
    title: "Support overtime up 23% — redeploy instead of hiring",
    department: "Customer Support",
    severity: "Critical",
    category: "Cost saving",
    problem: "Overtime cost in Customer Support rose 23% over six weeks and keeps climbing.",
    evidence: [
      "Team A utilization 126%, Team C utilization 64%",
      "Six employees generate 61% of all overtime hours",
      "Ticket volume +19% since the March launch, staffing unchanged",
    ],
    cause: "Workload distribution, not volume alone. Evening coverage drops below 70% mid-week.",
    affected: "3 overloaded employees, 24 team members in scope",
    financial: "$186K annualized overtime exposure; $268K avoided vs hiring",
    operational: "SLA breach probability rises to 38% within 8 weeks if unchanged",
    recommendation: "Move two Operations agents into Support for 90 days and stagger evening rest days.",
    alternatives: [
      "Change shift distribution only — slower, saves $61K",
      "Hire one temporary agent — $34K cost, 31 days to fill",
    ],
    confidence: 87,
    owner: "Layla Haddad, Head of Support",
    approval: "CHRO approval required",
  },
  {
    id: "REC-1038",
    title: "Bonus paid before approval — payroll control breach",
    department: "Finance / Payroll",
    severity: "Critical",
    category: "Risk",
    problem: "An $18.4K bonus batch for Sales Team B was released before the approval step completed.",
    evidence: [
      "Workflow run WF-812 skipped approval node 4",
      "Named approver deactivated in August",
      "26 other runs failed at the same node",
    ],
    cause: "Workflow uses a named approver instead of a role-based approver.",
    affected: "11 employees paid, 26 stalled workflow runs",
    financial: "$18.4K unapproved spend; control finding risk at audit",
    operational: "26 processes blocked across payroll and contracts",
    recommendation: "Switch to role-based approval, re-run the 26 blocked cases, and record a control exception.",
    alternatives: ["Manually approve retroactively — does not prevent recurrence"],
    confidence: 94,
    owner: "Rina Kaur, CFO",
    approval: "CFO approval required",
  },
  {
    id: "REC-1035",
    title: "Internal candidate available for Support Team Lead",
    department: "Customer Support",
    severity: "High",
    category: "Growth",
    problem: "An external search is running for a role with a strong internal match.",
    evidence: [
      "Ahmed Sabry matches 91% of the role skill profile",
      "Two more Tier 2 agents match above 80%",
      "External shortlist average match 74%",
    ],
    cause: "Requisition defaulted to external sourcing; internal-first policy is off.",
    affected: "3 internal candidates, 1 open requisition",
    financial: "$4.2K sourcing saving, faster ramp worth ~$11K",
    operational: "Time to fill drops from 31 to 9 days",
    recommendation: "Pause external sourcing for 10 days and run internal assessments first.",
    alternatives: ["Run both tracks in parallel — keeps cost, halves the saving"],
    confidence: 79,
    owner: "Talent Acquisition",
    approval: "Hiring manager approval required",
  },
  {
    id: "REC-1030",
    title: "Payroll configuration depends on two people",
    department: "Finance / Payroll",
    severity: "High",
    category: "Risk",
    problem: "Only two employees can configure payroll, and one is close to retirement.",
    evidence: ["Skill coverage 2 holders vs 4 required", "No documented run book", "No successor named"],
    cause: "Knowledge transfer was never scheduled after the last re-platform.",
    affected: "2 employees, $8.4M monthly process",
    financial: "Process disruption exposure estimated at $220K",
    operational: "Single point of failure on every payroll run",
    recommendation: "Certify two backups within 90 days and publish the run book.",
    alternatives: ["External payroll support retainer — $46K/year"],
    confidence: 88,
    owner: "People Operations",
    approval: "HR Director approval required",
  },
  {
    id: "REC-1024",
    title: "Duplicate transport allowance on 14 records",
    department: "Payroll",
    severity: "Medium",
    category: "Cost saving",
    problem: "Two allowance rules overlap and pay the same benefit twice.",
    evidence: ["14 records across 3 cost centers", "Rules ALW-03 and ALW-07 both active"],
    cause: "September policy merge kept both rules live.",
    affected: "14 employees",
    financial: "$48K recurring annual leakage",
    operational: "Corrections must land before the run closes on the 27th",
    recommendation: "Retire rule ALW-07 and reconcile the 14 records this cycle.",
    alternatives: ["Correct records only — leakage returns next month"],
    confidence: 92,
    owner: "Payroll team",
    approval: "Auto-executable after review",
  },
];

export type Approval = {
  id: string;
  type: string;
  subject: string;
  requestedBy: string;
  amount: string;
  age: string;
  risk: "Low" | "Medium" | "High";
};

export const approvals: Approval[] = [
  { id: "AP-2211", type: "Salary change", subject: "4.5% adjustment — 19 senior engineers", requestedBy: "Compensation Agent", amount: "$212,000", age: "1 day", risk: "Medium" },
  { id: "AP-2209", type: "Headcount", subject: "Redeploy 2 agents to Support (90 days)", requestedBy: "Workforce Agent", amount: "$0", age: "6 hours", risk: "Low" },
  { id: "AP-2208", type: "Payroll", subject: "October run — 9 anomalies unresolved", requestedBy: "Payroll Agent", amount: "$702,000", age: "3 hours", risk: "High" },
  { id: "AP-2204", type: "Hiring", subject: "Senior Backend Engineer offer", requestedBy: "M. Osei", amount: "$78,000", age: "2 days", risk: "Medium" },
  { id: "AP-2199", type: "Promotion", subject: "Ahmed Sabry → Support Team Lead", requestedBy: "L. Haddad", amount: "$9,400", age: "4 days", risk: "Low" },
  { id: "AP-2194", type: "Leave", subject: "Karim Adel — 20 to 28 Oct (coverage conflict)", requestedBy: "Employee Agent", amount: "—", age: "5 days", risk: "Medium" },
];

export type Employee = {
  id: string;
  name: string;
  title: string;
  department: string;
  location: string;
  manager: string;
  grade: string;
  type: string;
  joined: string;
  status: string;
  utilization: number;
  goalAchievement: number;
  riskFlag: string;
  strengths: string[];
  development: string[];
  summary: string;
  actions: string[];
};

export const employees: Employee[] = [
  {
    id: "e-1042",
    name: "Ahmed Sabry",
    title: "Support Specialist, Tier 2",
    department: "Customer Support",
    location: "Cairo",
    manager: "Layla Haddad",
    grade: "G4",
    type: "Full time",
    joined: "14 Mar 2022",
    status: "Active",
    utilization: 126,
    goalAchievement: 87,
    riskFlag: "Overload",
    strengths: ["Client management", "Escalation handling", "Product knowledge"],
    development: ["Data analysis", "People management"],
    summary:
      "Ahmed achieves 87% of assigned objectives. Current workload is 18% above the team average and overtime has been above policy for six weeks. He matches 91% of the Support Team Lead profile.",
    actions: [
      "Reduce assigned workload by 10% for 60 days",
      "Assign analytics fundamentals training",
      "Include in Support Team Lead internal assessment",
    ],
  },
  {
    id: "e-1188",
    name: "Dana Lewis",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Berlin",
    manager: "Nadia Farouk",
    grade: "G5",
    type: "Full time",
    joined: "02 Aug 2021",
    status: "Active",
    utilization: 108,
    goalAchievement: 92,
    riskFlag: "Pay below band",
    strengths: ["System design", "Postgres", "Mentoring"],
    development: ["Kafka", "Incident command"],
    summary:
      "Dana is 8% below band midpoint while carrying two critical services. Attrition risk is elevated, and she is one of four internal Kafka-adjacent engineers.",
    actions: ["Include in targeted pay adjustment", "Enroll in Kafka cohort", "Name as backup for billing migration"],
  },
  {
    id: "e-1301",
    name: "Youssef Amin",
    title: "Support Specialist, Tier 1",
    department: "Customer Support",
    location: "Cairo",
    manager: "Layla Haddad",
    grade: "G3",
    type: "Full time",
    joined: "19 Jan 2024",
    status: "Active",
    utilization: 131,
    goalAchievement: 74,
    riskFlag: "Burnout risk",
    strengths: ["Responsiveness", "Product knowledge"],
    development: ["Escalation handling", "Time management"],
    summary:
      "Youssef logged 4.2 hours of overtime yesterday and is the single largest overtime contributor on the team. Goal achievement is falling as workload rises.",
    actions: ["Cap weekly overtime at 8 hours", "Reassign 6 recurring tickets", "Schedule manager check-in this week"],
  },
  {
    id: "e-1422",
    name: "Marta Silva",
    title: "Account Executive",
    department: "Field Sales",
    location: "Lisbon",
    manager: "Michael Osei",
    grade: "G5",
    type: "Full time",
    joined: "05 May 2020",
    status: "Active",
    utilization: 88,
    goalAchievement: 104,
    riskFlag: "Successor candidate",
    strengths: ["Enterprise sales", "Negotiation", "Forecast accuracy"],
    development: ["Team leadership"],
    summary:
      "Marta exceeds quota at 104% with spare capacity. She is the named successor for EMEA Sales Director, ready in roughly two years.",
    actions: ["Assign two enterprise accounts", "Start leadership development track"],
  },
  {
    id: "e-1508",
    name: "Karim Adel",
    title: "Operations Analyst",
    department: "Operations",
    location: "Cairo",
    manager: "Samir Nabil",
    grade: "G4",
    type: "Full time",
    joined: "11 Sep 2023",
    status: "Active",
    utilization: 64,
    goalAchievement: 68,
    riskFlag: "Underutilized",
    strengths: ["Process mapping", "Reporting"],
    development: ["Escalation handling", "Customer communication"],
    summary:
      "Karim is running at 64% utilization while Support runs at 126%. His skill profile matches 78% of the Support Tier 2 role with two weeks of training.",
    actions: ["Propose 90-day redeployment to Support", "Assign escalation handling course"],
  },
  {
    id: "e-1610",
    name: "Nora Hassan",
    title: "People Operations Coordinator",
    department: "People Operations",
    location: "Dubai",
    manager: "Salma Meyer",
    grade: "G3",
    type: "Full time",
    joined: "27 Feb 2023",
    status: "Active",
    utilization: 92,
    goalAchievement: 95,
    riskFlag: "Duplicate allowance",
    strengths: ["Onboarding", "Document control"],
    development: ["HR analytics"],
    summary:
      "Nora's record carries two overlapping transport allowances from the September policy merge. Performance and goal delivery are strong.",
    actions: ["Correct allowance record before the run closes", "Consider for Onboarding Specialist opening"],
  },
];

export const employeeById = Object.fromEntries(employees.map((e) => [e.id, e]));
