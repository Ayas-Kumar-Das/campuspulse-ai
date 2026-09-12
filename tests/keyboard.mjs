import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000/dashboard");
await page
  .getByRole("button", { name: "Search CampusPulse", exact: true })
  .click();
const dialog = page.getByRole("dialog");
await dialog.waitFor();
await dialog.locator("input").focus();
await page.keyboard.press("Shift+Tab");
assert.equal(
  await dialog
    .locator("button")
    .last()
    .evaluate((el) => el === document.activeElement),
  true,
);
await page.keyboard.press("Tab");
assert.equal(
  await dialog.locator("input").evaluate((el) => el === document.activeElement),
  true,
);
await page.keyboard.press("Escape");
await dialog.waitFor({ state: "hidden" });
assert.equal(
  await page
    .getByRole("button", { name: "Search CampusPulse", exact: true })
    .evaluate((el) => el === document.activeElement),
  true,
);
console.log(
  "PASS: search traps Tab and Shift+Tab; Escape restores trigger focus.",
);
await browser.close();
