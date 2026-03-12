import { test, expect } from "@playwright/test";

test("user can see onboarding page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("One Day Less")).toBeVisible();
  await expect(page.getByText("又少了一天，你想怎么过？")).toBeVisible();
});

