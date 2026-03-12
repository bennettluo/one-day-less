import { test } from "@playwright/test";
import path from "path";

const baseUrl =
  process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test("capture home counter section screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${baseUrl}/home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const mainSection = page.locator("main section").first();

  const screenshotPath = path.join(
    process.cwd(),
    "apps",
    "web",
    "public",
    "home-counter.png"
  );

  await mainSection.screenshot({
    path: screenshotPath
  });
});

