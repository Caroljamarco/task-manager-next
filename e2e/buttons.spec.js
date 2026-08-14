import { test, expect } from "@playwright/test";

test("primary flow: a button completes its full lifecycle from click to success", async ({
  page,
}) => {
  await page.goto("/buttons-demo");
  await page.getByRole("button", { name: "Simulate success" }).click();
  await expect(page.getByText("Sending…")).toBeVisible();
  await expect(page.getByText("Sent")).toBeVisible({ timeout: 3000 });
});

test("primary flow: a failed action shows a retry state requiring user action", async ({
  page,
}) => {
  await page.goto("/buttons-demo");
  await page.getByRole("button", { name: "Simulate error" }).click();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible({
    timeout: 3000,
  });
});
