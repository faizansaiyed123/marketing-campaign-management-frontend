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

  const audienceState = await page.evaluate(async () => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/audiences", { credentials: "include" });
    return response.json();
  });
  expect(audienceState).toHaveLength(1);
  expect(audienceState[0].contact_count).toBe(1);
  const contactState = await page.evaluate(async (audienceId) => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/audiences/" + audienceId + "/contacts", { credentials: "include" });
    return response.json();
  }, audienceState[0].id);
  expect(contactState).toHaveLength(1);
  expect(contactState[0].unsubscribed_at).toBeNull();

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
  await expect(page.locator(".analytics-grid .stat").nth(0).locator("strong")).toHaveText("1");
  await expect(page.locator(".analytics-grid .stat").nth(1).locator("strong")).toHaveText("0");
});

test("authentication errors are surfaced in the browser", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email").fill("does-not-exist@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".alert")).toContainText("Invalid email or password");
});


test("session survives reload, duplicate-contact errors are surfaced, and logout clears the session", async ({ page }) => {
  const email = uniqueEmail("session");

  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Session User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  await page.locator(".sidebar nav").first().getByRole("button", { name: /Audience/ }).click();
  const audienceName = "Duplicate Test " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();

  await page.getByPlaceholder("Email").fill("duplicate@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("duplicate@example.com")).toBeVisible();

  await page.getByPlaceholder("Email").fill("DUPLICATE@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.locator(".toast")).toContainText("Contact already exists in this audience");

  await page.locator(".logout").click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("scheduled campaigns can be created, edited back to draft, and executed", async ({ page }) => {
  const email = uniqueEmail("schedule");

  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Schedule User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();

  await page.locator(".sidebar nav").first().getByRole("button", { name: /Audience/ }).click();
  const audienceName = "Schedule Audience " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();

  await page.getByPlaceholder("Email").fill("scheduled-contact@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("scheduled-contact@example.com")).toBeVisible();

  await page.getByRole("button", { name: "Campaigns" }).click();
  await page.getByRole("button", { name: "New campaign" }).click();
  await page.getByLabel("Campaign name").fill("Scheduled Campaign");
  await page.getByLabel("Subject").fill("Scheduled subject");
  await page.getByLabel("Message HTML").fill("<p>Scheduled message</p>");

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const p = (value) => String(value).padStart(2, "0");
  await page.locator('input[type="datetime-local"]:visible').last().fill(
    tomorrow.getFullYear() + "-" + p(tomorrow.getMonth() + 1) + "-" +
    p(tomorrow.getDate()) + "T" + p(tomorrow.getHours()) + ":" + p(tomorrow.getMinutes())
  );
  await page.getByRole("button", { name: "Save campaign" }).click();

  const row = page.locator(".campaign-row").filter({ hasText: "Scheduled Campaign" });
  await expect(row).toContainText("scheduled");
  await row.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: "Edit campaign" })).toBeVisible();

  await page.getByLabel("Subject").fill("Updated scheduled subject");
  await page.locator("form.editor").getByLabel("Schedule").fill("");
  await page.getByRole("button", { name: "Save campaign" }).click();
  await expect(page.locator(".campaign-row").filter({ hasText: "Scheduled Campaign" })).toContainText("draft");

  await page.locator(".campaign-row").filter({ hasText: "Scheduled Campaign" })
    .getByRole("button", { name: "Execute" }).click();
  await expect(page.locator(".report-card")).toContainText("Latest run: queued");
  await expect(page.locator(".report-card")).toContainText("Recipients");
});
