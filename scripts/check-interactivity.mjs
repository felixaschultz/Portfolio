import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:5173";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});

await page.goto(`${base}/da/photography/ekif-vs-starup`, { waitUntil: "networkidle" });

const beforeUrl = page.url();
await page.locator("article .columns-1 button").first().click();
await page.waitForTimeout(400);
const afterUrl = page.url();
const dialogCount = await page.locator('[role="dialog"]').count();

console.log("before:", beforeUrl);
console.log("after:", afterUrl);
console.log("dialogs:", dialogCount);
console.log("url changed:", beforeUrl !== afterUrl);

await page.goto(`${base}/da`);
await page.keyboard.press("Meta+k");
await page.waitForTimeout(400);
const searchInputs = await page.locator('input[type="search"]').count();
console.log("search inputs after Cmd+K:", searchInputs);

if (errors.length) {
  console.log("errors:");
  for (const e of errors) console.log(" -", e);
}

await browser.close();
