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
  await expect(page.locator("form.editor")).toContainText("{{first_name}}");
  await expect(page.locator("form.editor")).toContainText("{{full_name}}");

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

test("saved templates are private and populate a new campaign", async ({ page }) => {
  const email = uniqueEmail("templates");
  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Template User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  const nav = page.locator(".sidebar nav").first();
  await nav.getByRole("button", { name: "Audience", exact: true }).click();
  const audienceName = "Template Audience " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();

  await nav.getByRole("button", { name: "Templates", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Templates", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "New template" }).click();
  await page.getByLabel("Template name").fill("Welcome Template");
  await page.getByLabel("Template subject").fill("Welcome {{first_name}}");
  await page.getByLabel("Template HTML").fill("<p>Hello {{first_name}}, welcome aboard.</p>");
  await page.getByRole("button", { name: "Save template" }).click();
  await expect(page.getByText("Welcome Template", { exact: true })).toBeVisible();

  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  await page.getByRole("button", { name: "New campaign" }).click();
  await page.getByLabel("Start from template").selectOption({ label: "Welcome Template" });
  await expect(page.getByLabel("Subject")).toHaveValue("Welcome {{first_name}}");
  await expect(page.getByLabel("Message HTML")).toHaveValue("<p>Hello {{first_name}}, welcome aboard.</p>");
  await page.getByLabel("Campaign name").fill("Template-based campaign");
  const audienceSelect = page.locator("form.editor").getByLabel("Audience");
  const audienceOption = audienceSelect.locator("option").filter({ hasText: audienceName });
  await audienceSelect.selectOption(await audienceOption.getAttribute("value"));
  await page.getByRole("button", { name: "Save campaign" }).click();
  await expect(page.getByText("Template-based campaign", { exact: true })).toBeVisible();

});

test("mobile workspace navigation remains visible and accessible", async ({ page }) => {
  const email = uniqueEmail("mobile-nav");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Mobile Navigation User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();

  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  const nav = page.locator(".sidebar nav").first();
  for (const name of ["Overview", "Campaigns", "Audience", "Analytics"]) {
    const button = nav.getByRole("button", { name, exact: true });
    await expect(button).toBeVisible();
    await expect(button.locator(".nav-icon")).toBeVisible();
  }

  await nav.getByRole("button", { name: "Audience", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Audience", exact: true })).toBeVisible();
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
  await page.locator("form.editor:visible input[type=\"datetime-local\"]").fill("");
  await page.getByRole("button", { name: "Save campaign" }).click();
  await expect(page.locator(".campaign-row").filter({ hasText: "Scheduled Campaign" })).toContainText("draft");

  await page.locator(".campaign-row").filter({ hasText: "Scheduled Campaign" })
    .getByRole("button", { name: "Execute" }).click();
  await expect(page.locator(".report-card")).toContainText("Latest run: queued");
  await expect(page.locator(".report-card")).toContainText("Recipients");
});


test("campaign report displays skipped deliveries distinctly from sent and failed", async ({ page }) => {
  const email = uniqueEmail("skipped-delivery");
  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Skipped Delivery User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  const nav = page.locator(".sidebar nav").first();
  await nav.getByRole("button", { name: "Audience", exact: true }).click();
  const audienceName = "Skip Before Send " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();
  await page.getByPlaceholder("Email").fill("unsubscribe-before-send@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("unsubscribe-before-send@example.com")).toBeVisible();

  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  await page.getByRole("button", { name: "New campaign" }).click();
  await page.getByLabel("Campaign name").fill("Skip Unsubscribed Recipient");
  await page.getByLabel("Subject").fill("Subscription check");
  await page.getByLabel("Message HTML").fill("<p>Hello</p>");
  await page.getByRole("button", { name: "Save campaign" }).click();
  const row = page.locator(".campaign-row").filter({ hasText: "Skip Unsubscribed Recipient" });
  await expect(row).toBeVisible();

  // The real backend integration service has no external SMTP account. Simulate
  // the later report returned after a worker skips a just-unsubscribed contact.
  await page.route("**/api/v1/campaigns/*/report", async route => {
    const response = await route.fetch();
    const report = await response.json();
    report.latest_run_status = "completed";
    report.campaign.status = "completed";
    report.summary.queued = 0;
    report.summary.sent = 0;
    report.summary.failed = 0;
    report.summary.skipped = 1;
    report.summary.total = 1;
    await route.fulfill({ response, json: report });
  });

  await row.getByRole("button", { name: "Execute" }).click();
  await expect(page.locator(".report-card")).toContainText("Latest run: queued");
  await expect(page.locator(".report-card")).toContainText("Latest run: completed", { timeout: 10000 });
  await expect(page.locator(".report-card")).toContainText("Skipped");
  await expect(page.locator(".report-card")).toContainText("1");
  await expect(page.locator(".report-card")).toContainText("Sent");
  await expect(page.locator(".report-card")).toContainText("Failed");
});
test("campaign delivery report refreshes when background processing completes", async ({ page }) => {
  const email = uniqueEmail("worker-report");
  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Worker Report User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  await page.locator(".sidebar nav").first().getByRole("button", { name: "Audience", exact: true }).click();
  const audienceName = "Worker Report Audience " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();
  await page.getByPlaceholder("Email").fill("worker-report@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("worker-report@example.com")).toBeVisible();

  await page.getByRole("button", { name: "Campaigns", exact: true }).click();
  await page.getByRole("button", { name: "New campaign" }).click();
  await page.getByLabel("Campaign name").fill("Worker Report Campaign");
  await page.getByLabel("Subject").fill("Background delivery status");
  await page.getByLabel("Message HTML").fill("<p>Queued for the worker</p>");
  await page.getByRole("button", { name: "Save campaign" }).click();
  const campaignRow = page.locator(".campaign-row").filter({ hasText: "Worker Report Campaign" });
  await expect(campaignRow).toBeVisible();

  // Mimic a worker completing the durable queue between the initial 202 response
  // and a subsequent GET report request. The integration backend intentionally
  // runs without an external SMTP account.
  await page.route("**/api/v1/campaigns/*/report", async route => {
    const response = await route.fetch();
    const report = await response.json();
    report.latest_run_status = "sent";
    report.campaign.status = "sent";
    report.summary.queued = 0;
    report.summary.sent = report.summary.total;
    await route.fulfill({ response, json: report });
  });

  await campaignRow.getByRole("button", { name: "Execute" }).click();
  await expect(page.locator(".report-card")).toContainText("Latest run: queued");
  await expect(page.locator(".report-card")).toContainText("Latest run: sent", { timeout: 10000 });
  await expect(page.locator(".report-card")).toContainText("Sent");
});


test("an empty completed campaign can be reused after contacts are added", async ({ page }) => {
  const email = uniqueEmail("empty-campaign");
  await page.goto("/");
  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await page.getByLabel("Name").fill("Empty Campaign User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();

  const nav = page.locator(".sidebar nav").first();
  await nav.getByRole("button", { name: "Audience", exact: true }).click();
  const audienceName = "Initially Empty Audience " + Date.now();
  await page.getByPlaceholder("New audience name").fill(audienceName);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(audienceName) })).toBeVisible();

  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  await page.getByRole("button", { name: "New campaign" }).click();
  await page.getByLabel("Campaign name").fill("Recover Empty Campaign");
  await page.getByLabel("Subject").fill("First attempt had no recipients");
  await page.getByLabel("Message HTML").fill("<p>Hello {{first_name}}</p>");
  const audienceSelect = page.locator("form.editor").getByLabel("Audience");
  const audienceOption = audienceSelect.locator("option").filter({ hasText: audienceName });
  await audienceSelect.selectOption(await audienceOption.getAttribute("value"));
  await page.getByRole("button", { name: "Save campaign" }).click();

  const row = page.locator(".campaign-row").filter({ hasText: "Recover Empty Campaign" });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Execute" }).click();
  await expect(page.locator(".report-card")).toContainText("Latest run: completed");
  await expect(page.locator(".report-card")).toContainText("Recipients");
  await expect(page.locator(".report-card")).toContainText("0");

  await nav.getByRole("button", { name: "Audience", exact: true }).click();
  await page.getByPlaceholder("Email").fill("added-after-empty@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("added-after-empty@example.com")).toBeVisible();

  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  const reusableRow = page.locator(".campaign-row").filter({ hasText: "Recover Empty Campaign" });
  await expect(reusableRow).toContainText("completed");
  await expect(reusableRow.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(reusableRow.getByRole("button", { name: "Execute" })).toBeVisible();
  await reusableRow.getByRole("button", { name: "Execute" }).click();
  await expect(page.locator(".report-card")).toContainText("Latest run: queued");
  await expect(page.locator(".report-card")).toContainText("Queued");
  await expect(page.locator(".report-card")).toContainText("Totals include delivery attempts across runs, including retries");
});
