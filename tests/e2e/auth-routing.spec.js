import { expect, test } from "@playwright/test";

test("Get started opens registration and unauthenticated app routes redirect to sign-in", async ({
  page
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Make room for/ })).toBeVisible();

  await page
    .getByRole("button", { name: /Get started/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();

  await page.getByRole("button", { name: /Already have an account\? Sign in/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.goto("/app");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
