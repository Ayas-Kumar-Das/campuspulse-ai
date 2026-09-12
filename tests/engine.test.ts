import { test } from "node:test";
import assert from "node:assert/strict";
import { eligibility, initialNotices, profiles, daysLeft } from "../lib/data";
const infosys = initialNotices.find((n) => n.id === "infosys")!;
test("Rahul is eligible, Aman fails CGPA", () => {
  assert.equal(eligibility(infosys, profiles[0]).status, "Eligible");
  const result = eligibility(infosys, profiles[1]);
  assert.equal(result.status, "Not eligible");
  assert.deepEqual(
    result.checks.filter((c) => !c.pass).map((c) => c.label),
    ["CGPA"],
  );
});
test("branch, year and backlog rules are deterministic", () => {
  for (const change of [{ branch: "ME" }, { year: 3 }, { backlogs: 1 }])
    assert.equal(
      eligibility(infosys, { ...profiles[0], ...change }).status,
      "Not eligible",
    );
});
test("missing unstructured criteria remain uncertain", () =>
  assert.equal(
    eligibility(
      { ...infosys, unknown: "Excellent academic standing" },
      profiles[0],
    ).status,
    "Possibly eligible",
  ));
test("inclusive CGPA boundary", () =>
  assert.equal(
    eligibility(infosys, { ...profiles[0], cgpa: 7 }).status,
    "Eligible",
  ));
test("deadline ordering uses a fixed demo clock", () => {
  assert.ok(daysLeft(initialNotices[0]) < daysLeft(infosys));
  assert.ok(daysLeft(infosys) < daysLeft(initialNotices[3]));
});
