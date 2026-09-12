import { Notice, Profile, eligibility } from "./data";
import {
  Progress,
  focusPlan,
  impact,
  consequences,
  hoursLeft,
  unlocks,
} from "./intelligence";
export function answerQuery(
  question: string,
  notices: Notice[],
  profile: Profile,
  progress: Progress = {},
  resume = false,
  done: string[] = [],
  shortlists: Record<string, string> = {},
) {
  const q = question.toLowerCase();
  const ranked = [...notices].sort(
    (a, b) => impact(b, profile).score - impact(a, profile).score,
  );
  const mentioned = ranked.filter((n) =>
    n.title
      .toLowerCase()
      .split(" ")
      .some(
        (w) =>
          w.length > 2 &&
          !["the", "for", "and", "2026", "campus", "registration"].includes(
            w,
          ) &&
          q.includes(w),
      ),
  );
  let title = "Here’s where to focus.";
  let explanation = "Ranked by your eligibility, relevance and deadlines.";
  let results: Notice[] = [];
  let mode = "priority";
  let minutes = Number(q.match(/(\d+)\s*min/)?.[1] || 30);
  if (/certification|unlock/.test(q)) {
    const u = unlocks(notices, profile, "AWS");
    title = `AWS certification: ${u.before} → ${u.after} eligible opportunities`;
    explanation =
      "Simulated against the current notice pool. Other academic requirements still apply; this does not predict acceptance.";
    results = u.newPaths;
    mode = "unlock";
  } else if (/skip|ignore|don.t|consequence/.test(q)) {
    results = mentioned.slice(0, 1);
    title = results.length
      ? `If you skip ${results[0].title}`
      : "Which opportunity would you like to explore?";
    explanation = results.length
      ? consequences(results[0]).join(" → ")
      : "Name an opportunity, for example “What happens if I skip TCS?”";
    mode = "consequence";
  } else if (/minutes|\bmin\b|right now/.test(q)) {
    minutes = Math.max(5, Math.min(180, minutes));
    const plan = focusPlan(
      notices,
      profile,
      progress,
      resume,
      minutes,
      done,
      shortlists,
    );
    title = `Your next ${minutes} minutes`;
    explanation = `${plan.used} minutes planned, ${plan.remaining} minutes free. Only unlocked actions that fit are included.`;
    results = plan.selected.map((i) => i.notice);
    mode = "focus";
  } else if (/should i|comes first| or |compare/.test(q)) {
    results = mentioned
      .filter(
        (n) =>
          !n.informational &&
          hoursLeft(n) > 0 &&
          eligibility(n, profile).status === "Eligible",
      )
      .slice(0, 3)
      .sort((a, b) => hoursLeft(a) - hoursLeft(b));
    title = results.length
      ? `${results[0].title} comes first`
      : "Name two opportunities to compare";
    explanation =
      "Protect the earlier deadline first, then consider impact and effort. Check the action plan before committing your time.";
    mode = "comparison";
  } else if (/why|seeing|explain/.test(q)) {
    results = mentioned.length ? mentioned.slice(0, 1) : ranked.slice(0, 1);
    const s = results[0] ? impact(results[0], profile) : null;
    title = "Why this matters to you";
    explanation = s
      ? `${s.score}/100 impact. ${s.status}. ${s.hits.length ? `Matches: ${s.hits.join(", ")}.` : "Few direct profile matches."} Open the opportunity for the full breakdown.`
      : "No notices are available.";
    mode = "explanation";
  } else if (/eligible|eligibility/.test(q)) {
    results = ranked.filter(
      (n) =>
        (!/placement/.test(q) || n.category === "Placement") &&
        eligibility(n, profile).status !== "Not eligible" &&
        !n.informational &&
        hoursLeft(n) > 0,
    );
    title = "Opportunities you qualify for or should confirm";
    explanation =
      "Possibly eligible means the notice has unresolved requirements. Read the evidence before applying.";
    mode = "eligibility";
  } else {
    results = ranked
      .filter(
        (n) =>
          !n.informational &&
          !done.includes(`${profile.name}:${n.id}`) &&
          eligibility(n, profile).status !== "Not eligible" &&
          hoursLeft(n) > 0,
      )
      .filter((n) =>
        /scholar/.test(q)
          ? n.category === "Scholarship"
          : /hackathon/.test(q)
            ? n.category === "Hackathon"
            : /tomorrow/.test(q)
              ? n.deadline.slice(0, 10) === "2026-09-17"
              : /today/.test(q)
                ? hoursLeft(n) <= 24
                : /week|deadline|priorit|fit/.test(q)
                  ? hoursLeft(n) <= 168
                  : mentioned.includes(n),
      );
  }
  return { title, explanation, results: results.slice(0, 5), mode, minutes };
}
