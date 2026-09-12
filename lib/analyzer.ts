import { z } from "zod";
import { Notice } from "./data";
export const extractionSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum([
    "Placement",
    "Internship",
    "Scholarship",
    "Academic",
    "Hackathon",
    "Event",
    "Administrative",
  ]),
  organization: z.string().nullable(),
  deadline: z.string().nullable(),
  event_date: z.string().nullable(),
  career_impact: z.number().min(0).max(100).nullable(),
  summary: z.string().max(600),
  years: z.array(z.number().int().min(1).max(6)),
  branches: z.array(z.string()),
  minimum_cgpa: z.number().min(0).max(10).nullable(),
  maximum_backlogs: z.number().int().min(0).max(99).nullable(),
  other_requirements: z.array(z.string()),
  actions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      estimated_minutes: z.number().int().min(1).max(480),
      depends_on: z.array(z.string()),
    }),
  ),
  required_documents: z.array(z.string()),
  source_evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
export type Extraction = z.infer<typeof extractionSchema>;
export function localExtract(text: string): Extraction {
  const match = (r: RegExp) => text.match(r)?.[1];
  const cgpa = match(/CGPA\s*(?:≥|>=|:|of|minimum)?\s*(\d(?:\.\d+)?)/i);
  const deadlineSentence =
    text
      .split(/\n|(?<=[.!?])\s+/)
      .find((sentence) =>
        /closes|deadline|register by|apply by|submit by/i.test(sentence),
      ) || "";
  const iso = deadlineSentence.match(
    /(20\d{2}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:[+-]\d{2}:\d{2}|Z)?)?)/,
  )?.[1];
  const named = deadlineSentence.match(
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Sep)\s+(20\d{2})/i,
  );
  let day = iso || null;
  if (!day && named) {
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const m =
      named[2].toLowerCase() === "sep"
        ? 8
        : months.indexOf(named[2].toLowerCase());
    day = `${named[3]}-${String(m + 1).padStart(2, "0")}-${named[1].padStart(2, "0")}`;
  }
  const time = deadlineSentence.match(
    /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i,
  );
  let deadline: string | null = null;
  if (day?.includes("T") && /(Z|[+-]\d{2}:\d{2})$/.test(day)) deadline = day;
  else if (
    day &&
    time &&
    /\bIST\b|India Standard Time/i.test(deadlineSentence)
  ) {
    const hour =
      (Number(time[1]) % 12) + (time[3].toUpperCase() === "PM" ? 12 : 0);
    if (
      Number(time[1]) >= 1 &&
      Number(time[1]) <= 12 &&
      Number(time[2] || 0) < 60
    )
      deadline = `${day.slice(0, 10)}T${String(hour).padStart(2, "0")}:${time[2] || "00"}:00+05:30`;
  }
  const actions: Extraction["actions"] = [];
  for (const [id, title, regex, minutes] of [
    ["register", "Complete registration", /register|registration|apply/i, 10],
    ["resume", "Attach resume", /resume/i, 5],
    ["assessment", "Complete assessment", /assessment/i, 45],
    ["interview", "Attend interview if shortlisted", /interview/i, 60],
    ["submit", "Submit required form", /submit|renewal/i, 20],
  ] as const)
    if (regex.test(text))
      actions.push({
        id,
        title,
        estimated_minutes: minutes,
        depends_on: actions.length ? [actions[actions.length - 1].id] : [],
      });
  const unknown: string[] = [];
  if (
    /excellent academic|graduation year|shortlisted/i.test(text) &&
    /excellent academic|graduation year/i.test(text)
  )
    unknown.push(
      "Confirm ambiguous academic or graduation requirements with the issuer.",
    );
  if (!cgpa) unknown.push("Minimum CGPA is not specified.");
  if (!/no (?:active )?backlogs|0 backlogs/i.test(text))
    unknown.push("Backlog policy is not specified.");
  const year = /final.year/i.test(text)
    ? [4]
    : /3rd year|year 3/i.test(text)
      ? [3]
      : [];
  if (!year.length) unknown.push("Eligible years are not specified.");
  const branches = ["CSE", "IT", "ECE", "ME", "CE", "EE"].filter((b) =>
    new RegExp(`\\b${b}\\b`).test(text),
  );
  if (!branches.length && !/all branches/i.test(text))
    unknown.push("Eligible branches are not specified.");
  if (day && !deadline)
    unknown.push(
      "A date was found, but its time or timezone needs confirmation.",
    );
  return extractionSchema.parse({
    title: text.split("\n")[0].slice(0, 200),
    category: /hiring|placement/i.test(text)
      ? "Placement"
      : /scholarship/i.test(text)
        ? "Scholarship"
        : /internship/i.test(text)
          ? "Internship"
          : /hackathon/i.test(text)
            ? "Hackathon"
            : /exam/i.test(text)
              ? "Academic"
              : /information only|no action/i.test(text)
                ? "Administrative"
                : "Event",
    organization: null,
    deadline,
    event_date: null,
    career_impact: null,
    summary: text.slice(0, 500),
    years: year,
    branches,
    minimum_cgpa: cgpa ? Number(cgpa) : null,
    maximum_backlogs: /no (?:active )?backlogs|0 backlogs/i.test(text)
      ? 0
      : null,
    other_requirements: unknown,
    actions,
    required_documents: /resume/i.test(text) ? ["Resume"] : [],
    source_evidence: [text.slice(0, 1500)],
    confidence: 0.65,
  });
}
export function toNotice(e: Extraction, text: string): Notice {
  if (
    e.event_date &&
    (!Number.isFinite(Date.parse(e.event_date)) ||
      !/(Z|[+-]\d{2}:\d{2})$/.test(e.event_date))
  )
    throw new Error(
      "Provide a valid event date including timezone, or leave it blank.",
    );
  const ids = e.actions.map((a) => a.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("Action identifiers must be unique.");
  for (let i = 0; i < e.actions.length; i++)
    if (e.actions[i].depends_on.some((d) => !ids.slice(0, i).includes(d)))
      throw new Error("Actions must depend only on earlier steps.");
  if (
    e.deadline &&
    (!Number.isFinite(Date.parse(e.deadline)) ||
      !/(Z|[+-]\d{2}:\d{2})$/.test(e.deadline))
  )
    throw new Error("Provide a valid deadline including its timezone.");
  const missing = [
    ...e.other_requirements,
    ...(!e.years.length && !/all years/i.test(text)
      ? ["Eligible years not specified"]
      : []),
    ...(!e.branches.length && !/all branches/i.test(text)
      ? ["Eligible branches not specified"]
      : []),
    ...(e.minimum_cgpa === null ? ["Minimum CGPA not specified"] : []),
    ...(e.maximum_backlogs === null ? ["Backlog policy not specified"] : []),
  ];
  return {
    id: `analyzed-${Date.now()}`,
    title: e.title,
    org: e.organization || "Issuer not specified",
    category: e.category,
    summary: e.summary,
    deadline: e.deadline || "",
    eventDate: e.event_date || undefined,
    careerImpact: e.career_impact ?? undefined,
    minCgpa: e.minimum_cgpa ?? 0,
    branches: e.branches,
    year: 0,
    years: e.years,
    backlogs: e.maximum_backlogs ?? 99,
    score: 0,
    action: "View action plan",
    source: text,
    unknown: missing.length ? [...new Set(missing)].join(" · ") : undefined,
    actions: e.actions.map((a) => ({
      id: a.id,
      title: a.title,
      minutes: a.estimated_minutes,
      dependsOn: a.depends_on,
      resume: /resume/i.test(a.id + " " + a.title),
      conditional: /if shortlisted/i.test(a.title),
    })),
    documents: e.required_documents,
    evidence: e.source_evidence.filter((s) => text.includes(s)),
    confidence: e.confidence,
    origin: "Analyzed notice",
    effort: e.actions[0]?.estimated_minutes || 15,
    informational:
      e.actions.length === 0 && /no action|information only/i.test(text),
  };
}
