import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
await mkdir(".impeccable/review", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000/dashboard");
await page.getByRole("heading", { name: "Good morning, Rahul." }).waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: ".impeccable/review/desktop.png",
  fullPage: true,
});
await page
  .getByRole("button", { name: "Infosys Campus Hiring 2026", exact: true })
  .click();
await page.getByRole("heading", { name: "Why this matches you" }).waitFor();
assert.equal(await page.getByText("Does not meet", { exact: true }).count(), 0);
await page.goto("http://localhost:3000/opportunities/exam");
await page.getByRole("button", { name: "Mark action complete" }).click();
await page.getByRole("button", { name: "Reopen task" }).waitFor();
await page.goto("http://localhost:3000/profile");
await page.getByLabel("Demo student").selectOption("Aman");
await page.goto("http://localhost:3000/opportunities/infosys");
await page.getByText("Not eligible", { exact: true }).waitFor();
await page.getByText("Does not meet", { exact: true }).waitFor();
await page.goto("http://localhost:3000/admin");
await page.getByRole("button", { name: "New notice" }).click();
await page.getByRole("button", { name: "Use sample notice" }).click();
await page.getByRole("button", { name: "Prepare review" }).click();
await page.getByLabel("I verified these fields against the notice.").check();
await page.getByRole("button", { name: "Publish notice", exact: true }).click();
await page
  .getByRole("heading", { name: "A new opportunity is live." })
  .waitFor();
await page.goto("http://localhost:3000/opportunities");
await page
  .getByRole("button", { name: "FutureWorks Campus Hiring 2026", exact: true })
  .waitFor();
await page.goto("http://localhost:3000/assistant");
await page.getByLabel("Ask CampusPulse").fill("Any deadlines tomorrow?");
await page.getByRole("button", { name: "Send question" }).click();
await page
  .locator(".answer-row")
  .getByText("Semester examination registration")
  .waitFor();
await page.evaluate(() => localStorage.clear());
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/dashboard");
await page.getByRole("heading", { name: "Good morning, Rahul." }).waitFor();
await page.screenshot({
  path: ".impeccable/review/mobile.png",
  fullPage: true,
});
assert.ok(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  "Mobile must not overflow",
);
assert.deepEqual(errors, []);
console.log(
  "PASS: dashboard, eligibility, completion, profile switching, notice publishing, assistant, mobile overflow; no runtime errors.",
);
await browser.close();
