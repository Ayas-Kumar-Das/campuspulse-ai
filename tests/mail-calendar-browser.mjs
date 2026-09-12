import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

await mkdir(".impeccable/review", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto("http://localhost:3000/mail");
await page.getByRole("heading", { name: "Your college mail, made actionable." }).waitFor();
await page.screenshot({ path: ".impeccable/review/mail-desktop.png", fullPage: true });
await page.getByRole("button", { name: "Analyze email" }).click();
await page.getByRole("button", { name: /Add to opportunities/ }).waitFor({ timeout: 45000 });
await page.getByRole("button", { name: /Add to opportunities/ }).click();
await page.getByRole("heading", { name: "Why this matches you" }).waitFor();
assert.match(await page.url(), /\/opportunities\/analyzed-/);

await page.goto("http://localhost:3000/calendar");
await page.getByRole("button", { name: "Agenda view" }).click();
await page.evaluate(() => window.scrollTo(0, 0));
const calendarLink = page.getByRole("link", { name: /Add .* to Google Calendar/ }).first();
assert.match((await calendarLink.getAttribute("href")) || "", /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
await page.screenshot({ path: ".impeccable/review/calendar-desktop.png", fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/mail");
await page.getByRole("heading", { name: "Your college mail, made actionable." }).waitFor();
await page.screenshot({ path: ".impeccable/review/mail-mobile.png", fullPage: true });
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
await page.goto("http://localhost:3000/calendar");
await page.getByRole("button", { name: "Agenda view" }).click();
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: ".impeccable/review/calendar-mobile.png", fullPage: true });
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
assert.deepEqual(errors, []);
console.log("PASS: college mail analysis, opportunity conversion, Google Calendar links, and mobile layout.");
await browser.close();
