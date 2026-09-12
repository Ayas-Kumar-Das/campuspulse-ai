import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir(".impeccable/review/upgrade", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000/dashboard");
await page.getByRole("heading", { name: "Good morning, Rahul." }).waitFor();
await page.screenshot({
  path: ".impeccable/review/upgrade/desktop.png",
  fullPage: true,
});
await page.goto("http://localhost:3000/opportunities/tcs");
await page
  .getByRole("heading", { name: "Opportunity impact", exact: true })
  .waitFor();
await page.getByText("Why am I seeing this?", { exact: true }).click();
await page.getByRole("button", { name: "Mark done", exact: true }).click();
await page.getByText("Upload your resume first", { exact: false }).waitFor();
assert.equal(
  await page.getByRole("button", { name: "Mark done", exact: true }).count(),
  0,
);
await page.goto("http://localhost:3000/profile");
await page
  .getByLabel("Upload resume")
  .setInputFiles({
    name: "rahul-resume.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Rahul Sharma. Python and React projects."),
  });
await page.getByText("rahul-resume.txt", { exact: true }).waitFor();
await page.reload();
await page.getByText("rahul-resume.txt", { exact: true }).waitFor();
await page.getByLabel("Demo student").selectOption("Aman");
assert.equal(
  await page.getByText("rahul-resume.txt", { exact: true }).count(),
  0,
);
await page.getByLabel("Demo student").selectOption("Rahul Sharma");
await page.getByText("rahul-resume.txt", { exact: true }).waitFor();
await page.screenshot({
  path: ".impeccable/review/upgrade/profile.png",
  fullPage: true,
});
await page.goto("http://localhost:3000/opportunities/tcs");
await page
  .locator(".action-stepper li")
  .filter({ hasText: "Attach your resume" })
  .getByRole("button", { name: "Mark done", exact: true })
  .click();
await page
  .locator(".action-stepper li")
  .filter({ hasText: "Complete online assessment" })
  .getByRole("button", { name: "Mark done", exact: true })
  .click();
await page.getByLabel("Shortlist result").selectOption("yes");
await page.getByRole("button", { name: "Mark done", exact: true }).click();
await page.getByText("4/4 complete", { exact: true }).waitFor();
await page.getByRole("button", { name: "Undo", exact: true }).first().click();
await page.getByText("0/4 complete", { exact: true }).waitFor();
await page.screenshot({
  path: ".impeccable/review/upgrade/detail.png",
  fullPage: true,
});
await page.goto("http://localhost:3000/focus");
await page
  .getByRole("heading", { name: "Your next 30 minutes, sorted." })
  .waitFor();
await page.getByRole("button", { name: "15 minutes", exact: true }).click();
await page
  .getByRole("heading", { name: "Your next 15 minutes, sorted." })
  .waitFor();
await page.screenshot({
  path: ".impeccable/review/upgrade/focus.png",
  fullPage: true,
});
await page.goto("http://localhost:3000/analyze");
await page.getByRole("button", { name: "Use demo hiring notice" }).click();
await page.getByRole("button", { name: "Analyze notice", exact: true }).click();
await page.getByLabel("Title", { exact: true }).waitFor();
await page.getByLabel("I reviewed these fields against the source.").check();
await page.getByRole("button", { name: "Add to my opportunities" }).click();
await page
  .getByRole("heading", { name: "TCS Digital Hiring 2026", exact: true })
  .waitFor();
await page.getByRole("heading", { name: "Your action plan" }).waitFor();
await page.goto("http://localhost:3000/assistant");
await page
  .getByRole("button", { name: "What happens if I skip TCS?", exact: true })
  .click();
await page.getByRole("heading", { name: /If you skip TCS/ }).waitFor();
await page
  .getByRole("button", {
    name: "I have 30 minutes. What should I do?",
    exact: true,
  })
  .click();
await page
  .getByRole("heading", { name: "Your next 30 minutes", exact: true })
  .waitFor();
for (const route of [
  "dashboard",
  "focus",
  "profile",
  "opportunities/tcs",
  "analyze",
  "tasks",
]) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/" + route);
  await page.locator("h1").first().waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `${route} should fit mobile`,
  );
  if (["dashboard", "focus", "profile"].includes(route))
    await page.screenshot({
      path: `.impeccable/review/upgrade/mobile-${route}.png`,
      fullPage: true,
    });
}
await page.goto("http://localhost:3000/profile");
const download = page.waitForEvent("download");
await page.getByRole("button", { name: "Download resume" }).click();
assert.equal((await download).suggestedFilename(), "rahul-resume.txt");
await page.getByRole("button", { name: "Remove resume" }).click();
await page
  .getByLabel("Upload resume")
  .setInputFiles({
    name: "bad.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("invalid"),
  });
await page
  .getByRole("alert")
  .getByText("Choose a PDF, DOCX, or TXT resume.")
  .waitFor();
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: scores, workflow dependencies/undo, resume persistence/isolation/download/removal/validation, focus, analyzer, assistant, six mobile routes; no runtime errors.",
);
