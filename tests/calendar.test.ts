import test from "node:test";
import assert from "node:assert/strict";
import { googleCalendarUrl, initialNotices } from "../lib/data";

test("builds a prefilled Google Calendar deadline link", () => {
  const notice = initialNotices[1];
  const url = new URL(googleCalendarUrl(notice));
  assert.equal(url.origin, "https://calendar.google.com");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), `Deadline: ${notice.title}`);
  assert.match(url.searchParams.get("dates") || "", /^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/);
  assert.equal(url.searchParams.get("ctz"), "Asia/Kolkata");
});

test("returns no calendar link when a notice has no valid deadline", () => {
  assert.equal(googleCalendarUrl({ ...initialNotices[0], deadline: "" }), "");
});
