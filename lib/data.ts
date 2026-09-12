export type Profile = {
  name: string;
  branch: string;
  year: number;
  cgpa: number;
  backlogs: number;
  skills: string;
  interests: string;
  careerGoal?: string;
  certifications?: string;
};
export type Notice = {
  id: string;
  title: string;
  org: string;
  category: string;
  summary: string;
  deadline: string;
  eventDate?: string;
  minCgpa: number;
  branches: string[];
  year: number;
  backlogs: number;
  score: number;
  action: string;
  source: string;
  unknown?: string;
  years?: number[];
  requiredSkills?: string[];
  requiredCertifications?: string[];
  tags?: string[];
  careerImpact?: number;
  effort?: number;
  mandatory?: boolean;
  informational?: boolean;
  actions?: ActionStep[];
  consequence?: string[];
  documents?: string[];
  confidence?: number;
  evidence?: string[];
  origin?: string;
};
export type ActionStep = {
  id: string;
  title: string;
  minutes: number;
  dependsOn: string[];
  conditional?: boolean;
  resume?: boolean;
};
export const demoNow = new Date("2026-09-16T09:00:00+05:30");
export const profiles: Profile[] = [
  {
    name: "Rahul Sharma",
    branch: "CSE",
    year: 4,
    cgpa: 8.1,
    backlogs: 0,
    skills: "Python, React, Machine Learning",
    interests: "AI, Cloud, Software Engineering, Hackathons",
  },
  {
    name: "Aman",
    branch: "CSE",
    year: 4,
    cgpa: 6.6,
    backlogs: 0,
    skills: "Java, React",
    interests: "Software Engineering, Cloud",
  },
  {
    name: "Priya Patel",
    branch: "ECE",
    year: 3,
    cgpa: 8.9,
    backlogs: 0,
    skills: "Python, Embedded Systems",
    interests: "Research, AI",
  },
  {
    name: "Ananya Das",
    branch: "IT",
    year: 4,
    cgpa: 7.5,
    backlogs: 1,
    skills: "Design, React",
    interests: "Design, Hackathons",
  },
  {
    name: "Arjun Rao",
    branch: "ME",
    year: 2,
    cgpa: 7.8,
    backlogs: 0,
    skills: "CAD, Python",
    interests: "Research, Cloud",
  },
];
const seeds = [
  [
    "exam",
    "Semester examination registration",
    "Examination Cell",
    "Academic",
    "Your semester, one step closer. Complete your examination form and confirm your subjects.",
    "2026-09-17T17:00:00+05:30",
    0,
    [],
    0,
    99,
    100,
    "Complete form",
  ],
  [
    "infosys",
    "Infosys Campus Hiring 2026",
    "Training & Placement Cell",
    "Placement",
    "Start your career at Infosys. Applications are open for the Systems Engineer role.",
    "2026-09-18T17:00:00+05:30",
    7,
    ["CSE", "IT", "ECE"],
    4,
    0,
    93,
    "Register now",
  ],
  [
    "hackathon",
    "AI Innovation Hackathon",
    "Google Developer Group on Campus",
    "Hackathon",
    "Big ideas. Real impact. Build an AI-powered solution with a team of curious minds.",
    "2026-09-20T23:59:00+05:30",
    0,
    [],
    0,
    99,
    88,
    "View opportunity",
  ],
  [
    "research",
    "Cloud Research Internship",
    "Centre for Cloud Computing",
    "Internship",
    "Explore distributed systems with a research team. A 12-week, hands-on internship.",
    "2026-09-24T17:00:00+05:30",
    7.5,
    ["CSE", "IT", "ECE"],
    3,
    0,
    91,
    "View opportunity",
  ],
  [
    "merit",
    "Merit Scholarship 2026",
    "Student Welfare Office",
    "Scholarship",
    "Your hard work deserves recognition. Apply for this year’s academic merit scholarship.",
    "2026-09-26T17:00:00+05:30",
    8,
    [],
    0,
    0,
    86,
    "View opportunity",
  ],
  [
    "cloud",
    "Cloud Computing Workshop",
    "AWS Cloud Club",
    "Event",
    "From your first deployment to cloud architecture. Learn by building with your campus community.",
    "2026-09-22T10:00:00+05:30",
    0,
    [],
    0,
    99,
    84,
    "View opportunity",
  ],
] as const;
export const initialNotices: Notice[] = seeds.map((s) => ({
  id: s[0],
  title: s[1],
  org: s[2],
  category: s[3],
  summary: s[4],
  deadline: s[5],
  minCgpa: s[6],
  branches: [...s[7]],
  year: s[8],
  backlogs: s[9],
  score: s[10],
  action: s[11],
  source: `${s[1]}. ${s[4]} Registration closes ${new Date(s[5]).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}. ${s[6] ? `Minimum CGPA: ${s[6]}. ` : ""}${s[7].length ? `Eligible branches: ${s[7].join(", ")}. ` : ""}${s[8] ? `Year ${s[8]} or above. ` : ""}${s[9] === 0 ? "No active backlogs." : ""}`,
}));
export function eligibility(n: Notice, p: Profile) {
  const checks = [
    {
      label: "Branch",
      actual: p.branch,
      required: n.branches.length ? n.branches.join(" / ") : "All branches",
      pass: !n.branches.length || n.branches.includes(p.branch),
    },
    {
      label: "Year",
      actual: `Year ${p.year}`,
      required: n.years?.length
        ? n.years.join(" / ")
        : n.year
          ? `Year ${n.year}+`
          : "All years",
      pass: n.years?.length ? n.years.includes(p.year) : p.year >= n.year,
    },
    {
      label: "CGPA",
      actual: String(p.cgpa),
      required: n.minCgpa ? `≥ ${n.minCgpa}` : "No minimum",
      pass: p.cgpa >= n.minCgpa,
    },
    {
      label: "Backlogs",
      actual: String(p.backlogs),
      required: n.backlogs === 99 ? "No restriction" : `≤ ${n.backlogs}`,
      pass: p.backlogs <= n.backlogs,
    },
  ];
  for (const skill of n.requiredSkills || [])
    checks.push({
      label: "Skill",
      actual: p.skills,
      required: skill,
      pass: p.skills.toLowerCase().includes(skill.toLowerCase()),
    });
  for (const cert of n.requiredCertifications || [])
    checks.push({
      label: "Certification",
      actual: p.certifications || "None recorded",
      required: cert,
      pass: (p.certifications || "").toLowerCase().includes(cert.toLowerCase()),
    });
  return {
    checks,
    status: checks.some((c) => !c.pass)
      ? "Not eligible"
      : n.unknown
        ? "Possibly eligible"
        : "Eligible",
  };
}
export function daysLeft(n: Notice) {
  if (!n.deadline || !Number.isFinite(Date.parse(n.deadline))) return Infinity;
  const day = (d: Date) =>
    Date.UTC(
      ...(d
        .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
        .split("-")
        .map(Number)
        .map((v, i) => (i === 1 ? v - 1 : v)) as [number, number, number]),
    );
  return Math.round((day(new Date(n.deadline)) - day(demoNow)) / 86400000);
}
export function dateLabel(date: string) {
  if (!date || !Number.isFinite(Date.parse(date))) return "Not specified";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}
export function calendarDownload(n: Notice) {
  if (!n.deadline || !Number.isFinite(Date.parse(n.deadline))) return;
  const start = new Date(n.deadline)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, "\\$&");
  const blob = new Blob(
    [
      `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CampusPulse//EN\r\nBEGIN:VEVENT\r\nUID:${n.id}@campuspulse.demo\r\nDTSTAMP:${start}\r\nDTSTART:${start}\r\nSUMMARY:${escape(n.title)}\r\nDESCRIPTION:${escape(n.summary)}\r\nBEGIN:VALARM\r\nTRIGGER:-P1D\r\nACTION:DISPLAY\r\nDESCRIPTION:Opportunity deadline tomorrow\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR`,
    ],
    { type: "text/calendar" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${n.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
