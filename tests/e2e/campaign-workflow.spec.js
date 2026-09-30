import { expect, test } from "@playwright/test";

function uniqueEmail(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 100000) + "@example.com";
}

test("user can complete the audience-to-campaign frontend workflow against the API", async ({ page }) => {
  const email = uniqueEmail("workflow");

  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();

  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  await page.locator(".sidebar nav").first().getByRole("button", { name: /Audience/ }).click();
  await expect(page.getByRole("heading", { name: "Audience", exact: true })).toBeVisible();

  const audienceName = "E2E Audience " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();

  await page.getByPlaceholder("Email").fill("contact@example.com");
  await page.getByPlaceholder("First name").fill("Test");
  await page.getByPlaceholder("Last name").fill("Contact");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("contact@example.com")).toBeVisible();

  await page.getByRole("button", { name: "Unsubscribe" }).click();
  await expect(page.getByRole("button", { name: "Subscribe" })).toBeVisible();
  await page.getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByRole("button", { name: "Unsubscribe" })).toBeVisible();

  await page.getByRole("button", { name: "Campaigns" }).click();
  await expect(page.getByRole("heading", { name: "Campaigns" })).toBeVisible();
  await page.getByRole("button", { name: "New campaign" }).click();

  await page.getByLabel("Campaign name").fill("E2E Campaign");
  await page.getByLabel("Subject").fill("Integration test");
  await page.getByLabel("Message HTML").fill("<p>Hello {{first_name}}</p>");
  await page.getByRole("button", { name: "Save campaign" }).click();

  await expect(page.getByText("E2E Campaign", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Execute" }).click();

  await expect(page.locator(".report-card")).toContainText("Latest run: queued");
  await expect(page.locator(".report-card")).toContainText("Recipients");
  await expect(page.locator(".report-card")).toContainText("Queued");

  await page.getByRole("button", { name: "Analytics" }).click();
  await expect(page.locator(".stat").filter({ hasText: "Deliveries" }).locator("strong")).toHaveText("1");
  await expect(page.locator(".stat").filter({ hasText: "Sent" }).locator("strong")).toHaveText("0");
});

test("authentication errors are surfaced in the browser", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("does-not-exist@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".alert")).toContainText("Invalid email or password");
});
