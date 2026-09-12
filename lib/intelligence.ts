import {
  Notice,
  Profile,
  ActionStep,
  eligibility,
  demoNow,
  initialNotices,
} from "./data";
export type Progress = Record<string, string[]>;
export const progressKey = (p: Profile, n: Notice) => `${p.name}:${n.id}`;
export function hoursLeft(n: Notice) {
  return n.deadline
    ? (Date.parse(n.deadline) - demoNow.getTime()) / 3600000
    : Infinity;
}
export function deadlineText(n: Notice) {
  const h = hoursLeft(n);
  return !Number.isFinite(h)
    ? "No deadline specified"
    : h <= 0
      ? "Deadline passed"
      : h < 24
        ? `${Math.ceil(h)} hours left`
        : `${Math.floor(h / 24)} days left`;
}
const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[,;/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
export function impact(n: Notice, p: Profile) {
  const status = eligibility(n, p).status;
  const eligibilityScore =
    status === "Eligible" ? 100 : status === "Possibly eligible" ? 50 : 0;
  const text =
    `${n.title} ${n.summary} ${(n.tags || []).join(" ")}`.toLowerCase();
  const skills = tokens(p.skills),
    interests = tokens(p.interests);
  const hits = [...skills, ...interests].filter(
    (t) =>
      text.includes(t) ||
      t.split(" ").some((w) => w.length > 3 && text.includes(w)),
  );
  const goal = p.careerGoal || "Software Engineering";
  const careerFit =
    text.includes(goal.toLowerCase()) ||
    (goal.toLowerCase().includes("software") &&
      ["Placement", "Internship"].includes(n.category));
  const relevance = Math.min(100, 30 + hits.length * 12 + (careerFit ? 25 : 0));
  const h = hoursLeft(n);
  const urgency = !Number.isFinite(h)
    ? 15
    : h <= 0
      ? 0
      : h <= 24
        ? 100
        : h <= 72
          ? 90
          : h <= 168
            ? 75
            : h <= 336
              ? 55
              : 30;
  const career =
    n.careerImpact ??
    (["Placement", "Internship"].includes(n.category)
      ? 95
      : n.category === "Scholarship"
        ? 75
        : 55);
  const effort = n.effort ?? 15;
  const efficiency =
    effort <= 10
      ? 100
      : effort <= 20
        ? 85
        : effort <= 30
          ? 70
          : effort <= 60
            ? 50
            : 25;
  const breakdown = [
    { label: "Eligibility", value: eligibilityScore, weight: 30 },
    { label: "Personal relevance", value: relevance, weight: 25 },
    { label: "Deadline urgency", value: urgency, weight: 20 },
    { label: "Career impact", value: career, weight: 15 },
    { label: "Effort efficiency", value: efficiency, weight: 10 },
  ];
  const total = Math.round(
    breakdown.reduce((sum, b) => sum + (b.value * b.weight) / 100, 0),
  );
  const score =
    status === "Not eligible"
      ? Math.min(39, total)
      : h <= 0
        ? Math.min(20, total)
        : total;
  const priority = n.informational
    ? "Information"
    : status === "Not eligible"
      ? "Not eligible"
      : h <= 0
        ? "Expired"
        : n.mandatory || h <= 24
          ? "Must do"
          : score >= 65
            ? "Recommended"
            : "Explore";
  return {
    score,
    priority,
    breakdown,
    hits,
    careerFit,
    effort,
    status,
    label:
      score >= 80
        ? "High impact"
        : score >= 60
          ? "Worth exploring"
          : "Lower priority",
  };
}
export function stepsFor(n: Notice): ActionStep[] {
  if (n.informational) return [];
  return n.actions?.length
    ? n.actions
    : [
        {
          id: "action",
          title:
            n.action === "View opportunity"
              ? "Review and submit application"
              : n.action,
          minutes: n.effort || 15,
          dependsOn: [],
        },
      ];
}
export function workflow(
  n: Notice,
  p: Profile,
  progress: Progress,
  resume: boolean,
  shortlist: string = "pending",
) {
  const done = progress[progressKey(p, n)] || [];
  const eligible = eligibility(n, p).status;
  const result: (ActionStep & { status: string })[] = [];
  for (const s of stepsFor(n)) {
    const status =
      eligible !== "Eligible"
        ? "locked"
        : s.dependsOn.some(
              (id) =>
                !result.some(
                  (prior) => prior.id === id && prior.status === "completed",
                ),
            )
          ? "locked"
          : s.conditional && shortlist === "no"
            ? "skipped"
            : s.conditional && shortlist !== "yes"
              ? "conditional"
              : s.resume && !resume
                ? "needs-resume"
                : done.includes(s.id)
                  ? "completed"
                  : "ready";
    result.push({ ...s, status });
  }
  return result;
}
export function toggleStep(
  n: Notice,
  p: Profile,
  progress: Progress,
  id: string,
) {
  const key = progressKey(p, n),
    current = progress[key] || [];
  if (!current.includes(id)) return { ...progress, [key]: [...current, id] };
  const remove = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of stepsFor(n))
      if (s.dependsOn.some((d) => remove.has(d)) && !remove.has(s.id)) {
        remove.add(s.id);
        changed = true;
      }
  }
  return { ...progress, [key]: current.filter((s) => !remove.has(s)) };
}
export function focusPlan(
  notices: Notice[],
  p: Profile,
  progress: Progress,
  resume: boolean,
  minutes: number,
  completed: string[] = [],
  shortlists: Record<string, string> = {},
) {
  const candidates = notices
    .filter(
      (n) =>
        !n.informational &&
        hoursLeft(n) > 0 &&
        !completed.includes(progressKey(p, n)) &&
        eligibility(n, p).status === "Eligible",
    )
    .flatMap((n) => {
      const step = workflow(
        n,
        p,
        progress,
        resume,
        shortlists[progressKey(p, n)],
      ).find((s) => s.status === "ready");
      return step ? [{ notice: n, step, impact: impact(n, p) }] : [];
    })
    .sort(
      (a, b) =>
        (b.impact.priority === "Must do" ? 1000 : 0) +
        b.impact.score -
        ((a.impact.priority === "Must do" ? 1000 : 0) + a.impact.score),
    );
  let remaining = minutes;
  const selected: typeof candidates = [];
  const later: typeof candidates = [];
  for (const c of candidates) {
    if (c.step.minutes <= remaining) {
      selected.push(c);
      remaining -= c.step.minutes;
    } else later.push(c);
  }
  return { selected, later, used: minutes - remaining, remaining };
}
export function consequences(n: Notice) {
  return n.consequence?.length
    ? n.consequence
    : n.informational
      ? [
          "This notice has no required action.",
          "Skipping it does not block an application.",
        ]
      : [
          "The stated application or registration window may close.",
          "You may be unable to proceed to the next stage.",
          "Check the original notice for late-entry or extension policies.",
        ];
}
export function unlocks(notices: Notice[], p: Profile, certification: string) {
  const simulated = {
    ...p,
    certifications: `${p.certifications || ""}, ${certification}`,
  };
  const before = notices.filter(
    (n) =>
      !n.informational &&
      hoursLeft(n) > 0 &&
      eligibility(n, p).status === "Eligible",
  );
  const after = notices.filter(
    (n) =>
      !n.informational &&
      hoursLeft(n) > 0 &&
      eligibility(n, simulated).status === "Eligible",
  );
  return {
    before: before.length,
    after: after.length,
    newPaths: after.filter((n) => !before.some((b) => b.id === n.id)),
  };
}
const hiringSteps: ActionStep[] = [
  {
    id: "register",
    title: "Complete registration",
    minutes: 10,
    dependsOn: [],
  },
  {
    id: "resume",
    title: "Attach your resume",
    minutes: 5,
    dependsOn: ["register"],
    resume: true,
  },
  {
    id: "assessment",
    title: "Complete online assessment",
    minutes: 45,
    dependsOn: ["resume"],
  },
  {
    id: "interview",
    title: "Attend interview",
    minutes: 60,
    dependsOn: ["assessment"],
    conditional: true,
  },
];
export function demoNotices(): Notice[] {
  const base = initialNotices.map((n) => ({
    ...n,
    origin: "Synthetic demo notice",
    mandatory: n.id === "exam",
    careerImpact:
      n.category === "Placement" ? 100 : n.category === "Academic" ? 90 : 75,
    effort: n.id === "exam" ? 15 : 10,
    tags:
      n.id === "infosys"
        ? ["Software Engineering", "Python", "React"]
        : n.id === "hackathon"
          ? ["AI", "Machine Learning", "Hackathons"]
          : ["Cloud", "Research"],
    ...(n.id === "infosys"
      ? {
          actions: hiringSteps,
          documents: ["Resume"],
          source:
            n.source +
            " Register, upload resume, complete the online assessment, and attend the interview if shortlisted.",
          consequence: [
            "Registration closes on 18 September.",
            "Only registered applicants can take the campus assessment.",
            "Missing registration ends this campus hiring path.",
          ],
        }
      : {}),
    ...(n.id === "research"
      ? {
          requiredCertifications: ["AWS"],
          source: n.source + " AWS certification is required.",
        }
      : {}),
    ...(n.id === "cloud"
      ? {
          requiredCertifications: ["AWS"],
          title: "AWS Student Challenge",
          source:
            n.source + " AWS certification is required for this challenge.",
        }
      : {}),
  }));
  const make = (
    id: string,
    title: string,
    category: string,
    deadline: string,
    extra: Partial<Notice>,
  ): Notice => ({
    id,
    title,
    org: "Campus opportunity desk",
    category,
    summary: title,
    deadline,
    minCgpa: 0,
    branches: [],
    year: 0,
    backlogs: 99,
    score: 0,
    action: "View action plan",
    source: `${title}. Deadline ${deadline || "not specified"}.`,
    origin: "Synthetic demo notice",
    ...extra,
  });
  return [
    ...base,
    make(
      "tcs",
      "TCS Digital Hiring",
      "Placement",
      "2026-09-16T17:00:00+05:30",
      {
        minCgpa: 7.5,
        branches: ["CSE", "IT"],
        year: 3,
        backlogs: 0,
        effort: 10,
        careerImpact: 100,
        tags: ["Software Engineering", "Python", "React"],
        actions: hiringSteps,
        documents: ["Resume"],
        summary:
          "Your next career step is closer than you think. Registration closes today.",
        source:
          "TCS Digital Hiring. CSE and IT students in year 3 or above, CGPA ≥ 7.5, no active backlogs. Register by 16 September 2026 at 5 PM IST. Upload resume after registration, complete assessment, and attend interview if shortlisted.",
        consequence: [
          "Registration closes today at 5 PM.",
          "Unregistered students cannot enter this campus assessment.",
          "This hiring opportunity is lost unless the placement cell announces an extension.",
        ],
      },
    ),
    make(
      "cloud-drive",
      "Cloud Engineer Drive",
      "Placement",
      "2026-09-25T17:00:00+05:30",
      {
        minCgpa: 7,
        year: 3,
        requiredCertifications: ["AWS"],
        effort: 15,
        careerImpact: 95,
        tags: ["Cloud", "Software Engineering"],
        source:
          "Cloud Engineer Drive. Minimum CGPA 7.0, year 3 or above. AWS certification required. Register by 25 September 2026, 5 PM IST.",
      },
    ),
    make(
      "renewal",
      "Scholarship renewal",
      "Scholarship",
      "2026-09-17T17:00:00+05:30",
      {
        minCgpa: 6,
        effort: 20,
        careerImpact: 80,
        summary:
          "Keep your financial support on track. Renew your scholarship application.",
        source:
          "Scholarship renewal: CGPA 6.0 or above. Submit renewal form and income certificate by 17 September 2026 at 5 PM IST.",
        documents: ["Income certificate"],
        actions: [
          {
            id: "renew",
            title: "Submit renewal form and income certificate",
            minutes: 20,
            dependsOn: [],
          },
        ],
      },
    ),
    make(
      "exam-prep",
      "Semester examination preparation",
      "Academic",
      "2026-09-17T09:00:00+05:30",
      {
        mandatory: true,
        effort: 30,
        careerImpact: 95,
        action: "Review examination topics",
        summary: "Prepare your notes for tomorrow’s semester examination.",
        source:
          "Semester examination on 17 September 2026 at 9 AM IST. Review the published syllabus and bring your admit card.",
        actions: [
          {
            id: "prepare",
            title: "Review examination topics",
            minutes: 30,
            dependsOn: [],
          },
        ],
      },
    ),
    make(
      "research-award",
      "Research excellence award",
      "Scholarship",
      "2026-09-27T17:00:00+05:30",
      {
        unknown:
          "Excellent academic standing is not defined in the notice. Confirm with Student Welfare.",
        effort: 20,
        source:
          "Research excellence award. Students with excellent academic standing may apply. Registration closes 27 September 2026 at 5 PM IST.",
      },
    ),
    make("library", "Library hours extended for exams", "Administrative", "", {
      informational: true,
      careerImpact: 10,
      summary:
        "The library stays open until 11 PM throughout examination week.",
      source:
        "Library hours extended to 11 PM during examination week. For information only. No action is required.",
    }),
  ];
}
