// Deterministic full sample company used by the "Full sample company" switch on Data Sources.
export const SEED_TAG = "full-sample";

const DEPTS: { name: string; head: string; titles: string[]; base: number; locs: string[] }[] = [
  { name: "Engineering", head: "Omar Khalil", titles: ["Software Engineer", "Senior Engineer", "QA Engineer", "DevOps Engineer", "Engineering Manager"], base: 60000, locs: ["Cairo", "Dubai"] },
  { name: "Product", head: "Mona Adel", titles: ["Product Manager", "Product Designer", "UX Researcher", "Product Analyst"], base: 58000, locs: ["Cairo"] },
  { name: "Customer Support", head: "Hany Mostafa", titles: ["Support Agent", "Senior Support Agent", "Support Team Lead", "Quality Specialist"], base: 24000, locs: ["Alexandria", "Cairo"] },
  { name: "Field Sales", head: "Karim Fawzy", titles: ["Sales Executive", "Account Manager", "Regional Sales Lead", "Sales Analyst"], base: 36000, locs: ["Riyadh", "Dubai", "Cairo"] },
  { name: "Marketing", head: "Salma Nabil", titles: ["Marketing Specialist", "Content Lead", "Performance Marketer", "Brand Manager"], base: 38000, locs: ["Dubai"] },
  { name: "Finance", head: "Tarek Samir", titles: ["Accountant", "Financial Analyst", "Treasury Officer", "Finance Manager"], base: 45000, locs: ["Cairo"] },
  { name: "Payroll", head: "Rania Fathy", titles: ["Payroll Specialist", "Payroll Analyst", "Payroll Lead"], base: 34000, locs: ["Cairo"] },
  { name: "People Operations", head: "Layla Haddad", titles: ["HR Business Partner", "Recruiter", "HR Generalist", "L&D Specialist", "Compensation Analyst"], base: 40000, locs: ["Cairo", "Dubai"] },
  { name: "Operations", head: "Youssef Ali", titles: ["Operations Analyst", "Logistics Coordinator", "Operations Supervisor", "Procurement Officer"], base: 32000, locs: ["Alexandria", "Riyadh"] },
  { name: "Legal & Compliance", head: "Nour Hassan", titles: ["Legal Counsel", "Compliance Officer", "Contracts Specialist"], base: 55000, locs: ["Cairo"] },
  { name: "IT", head: "Sherif Gamal", titles: ["IT Support Engineer", "Systems Administrator", "Security Analyst", "IT Manager"], base: 42000, locs: ["Cairo"] },
  { name: "Data & Analytics", head: "Dina Ramadan", titles: ["Data Analyst", "Data Engineer", "Data Scientist", "BI Developer"], base: 57000, locs: ["Cairo", "Dubai"] },
];

const FIRST = ["Ahmed", "Mariam", "Mostafa", "Yasmin", "Khaled", "Hana", "Amr", "Farah", "Ziad", "Reem", "Hassan", "Nadia", "Adel", "Sara", "Mahmoud", "Aya", "Ibrahim", "Laila", "Sameh", "Malak", "Walid", "Noha", "Fady", "Jana"];
const LAST = ["Sabry", "Farouk", "Ezzat", "Mansour", "Salem", "Saad", "Lotfy", "Hamdy", "Wahba", "Taha", "Zaki", "Ashour", "Badr", "Kamel", "Rashad", "Nasser"];
const SKILLS = ["Leadership", "Excel", "SQL", "Negotiation", "Customer service", "Python", "Project management", "Communication", "Data analysis", "Compliance", "Coaching", "Cloud"];

export function buildFullSeed() {
  let n = 0;
  const rnd = (i: number, m: number) => ((i * 9301 + 49297) % 233280) % m;
  return DEPTS.flatMap((d, di) => {
    const people = [{ name: d.head, title: `Head of ${d.name}`, mgr: "Sara Mahmoud (CEO)", lead: true }];
    for (let k = 0; k < 7; k++) {
      n++;
      people.push({ name: `${FIRST[(n * 7 + di) % FIRST.length]} ${LAST[(n * 5 + k) % LAST.length]}`, title: d.titles[k % d.titles.length]!, mgr: d.head, lead: false });
    }
    return people.map((p, k) => {
      const i = di * 10 + k + 1;
      const util = p.lead ? 105 + rnd(i, 15) : 62 + rnd(i * 3, 60);
      const goals = 55 + rnd(i * 7, 45);
      const grade = p.lead ? "G9" : `G${3 + rnd(i * 11, 5)}`;
      const salary = Math.round((d.base * (p.lead ? 2.4 : 0.8 + rnd(i * 13, 70) / 100)) / 100) * 100;
      const overtime = util > 110 ? 20 + rnd(i, 30) : rnd(i, 10);
      const risk = util > 115 ? "Burnout risk" : goals < 62 ? "Low performance" : util < 70 ? "Underutilized" : k === 3 ? "Flight risk" : "";
      return {
        name: p.name, title: p.title, department: d.name, location: d.locs[k % d.locs.length]!, manager: p.mgr, grade,
        employment_type: k === 6 ? "Contractor" : "Full time", joined: `20${16 + rnd(i * 17, 9)}-${String(1 + rnd(i, 12)).padStart(2, "0")}-${String(1 + rnd(i * 2, 27)).padStart(2, "0")}`,
        status: k === 5 && di % 4 === 0 ? "On leave" : "Active", salary, utilization: util, goal_achievement: goals, risk_flag: risk,
        extra: {
          seed: SEED_TAG, performance_rating: (2 + rnd(i * 19, 31) / 10).toFixed(1), leave_balance_days: 4 + rnd(i * 23, 22),
          overtime_hours_month: overtime, training_hours_ytd: rnd(i * 29, 60), attendance_pct: 88 + rnd(i * 31, 12),
          bonus_target_pct: p.lead ? 20 : 5 + rnd(i, 10), last_review: `2026-0${1 + rnd(i * 37, 8)}-15`,
          skills: [SKILLS[i % SKILLS.length], SKILLS[(i * 3) % SKILLS.length]].join(", "), succession_ready: p.lead ? "No successor" : goals > 90 ? "Ready now" : "",
        },
      };
    });
  });
}

export const SEED_DEPARTMENTS = DEPTS.length;
