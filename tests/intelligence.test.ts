import { test } from "node:test";
import assert from "node:assert/strict";
import { profiles, eligibility } from "../lib/data";
import {
  demoNotices,
  impact,
  workflow,
  toggleStep,
  progressKey,
  focusPlan,
  unlocks,
  Progress,
} from "../lib/intelligence";
import { localExtract, toNotice } from "../lib/analyzer";
import { answerQuery } from "../lib/query";
const notices = demoNotices(),
  rahul = profiles[0],
  tcs = notices.find((n) => n.id === "tcs")!;
test("impact responds to academic eligibility and career profile", () => {
  assert.ok(impact(tcs, rahul).score > impact(tcs, profiles[1]).score);
  assert.equal(impact(tcs, rahul).priority, "Must do");
  assert.equal(impact(tcs, profiles[1]).priority, "Not eligible");
  assert.ok(
    impact(tcs, {
      ...rahul,
      skills: "Pottery",
      interests: "History",
      careerGoal: "Art",
    }).score < impact(tcs, rahul).score,
  );
});
test("workflow honors dependencies, resume availability and shortlist conditions", () => {
  let p: Progress = {};
  assert.deepEqual(
    workflow(tcs, rahul, p, false).map((s) => s.status),
    ["ready", "locked", "locked", "locked"],
  );
  p = toggleStep(tcs, rahul, p, "register");
  assert.equal(workflow(tcs, rahul, p, false)[1].status, "needs-resume");
  p = toggleStep(tcs, rahul, p, "resume");
  assert.equal(workflow(tcs, rahul, p, true)[2].status, "ready");
  assert.equal(workflow(tcs, rahul, p, false)[2].status, "locked");
  p = toggleStep(tcs, rahul, p, "assessment");
  assert.equal(workflow(tcs, rahul, p, true)[3].status, "conditional");
  assert.equal(workflow(tcs, rahul, p, true, "yes")[3].status, "ready");
  assert.equal(workflow(tcs, rahul, p, true, "no")[3].status, "skipped");
  p = toggleStep(tcs, rahul, p, "register");
  assert.deepEqual(p[progressKey(rahul, tcs)], []);
});
test("focus never exceeds budget or recommends locked/ineligible work", () => {
  const plan = focusPlan(notices, rahul, {}, false, 30);
  assert.ok(plan.used <= 30);
  assert.equal(plan.selected[0].notice.id, "tcs");
  assert.ok(
    plan.selected.every(
      (i) =>
        i.step.status === "ready" &&
        eligibility(i.notice, rahul).status === "Eligible",
    ),
  );
  assert.ok(
    focusPlan(notices, profiles[1], {}, false, 30).selected.every(
      (i) => i.notice.id !== "tcs",
    ),
  );
});
test("AWS simulation unlocks three actual paths without mutating profile", () => {
  const result = unlocks(notices, rahul, "AWS");
  assert.equal(result.newPaths.length, 3);
  assert.equal(rahul.certifications, undefined);
});
test("missing extraction fields remain unknown; invalid dependencies rejected", () => {
  const e = localExtract(
    "An exciting research program. Students with excellent academic standing can apply.",
  );
  assert.equal(e.deadline, null);
  const n = toNotice(e, "An exciting research program.");
  assert.equal(eligibility(n, rahul).status, "Possibly eligible");
  assert.throws(() =>
    toNotice(
      {
        ...e,
        actions: [
          { id: "a", title: "Apply", estimated_minutes: 10, depends_on: ["b"] },
        ],
      },
      "source",
    ),
  );
});
test("deadline requires time and preserves parsed IST time", () => {
  assert.equal(
    localExtract("Campus notice. Register by 2026-09-18. Minimum CGPA 7.0.")
      .deadline,
    null,
  );
  assert.equal(
    localExtract("Campus notice. Register by 16 September 2026 at 5 PM IST.")
      .deadline,
    "2026-09-16T17:00:00+05:30",
  );
});
test("assistant routes comparisons separately from AWS unlock and focus", () => {
  assert.equal(
    answerQuery(
      "Should I apply for TCS or attend the AWS Student Challenge?",
      notices,
      rahul,
    ).mode,
    "comparison",
  );
  assert.equal(answerQuery("I have 30 minutes", notices, rahul).mode, "focus");
  assert.equal(
    answerQuery("What if I skip TCS?", notices, rahul).mode,
    "consequence",
  );
});
