import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const visualsDirectory = path.resolve("docs/testing/visuals");

async function capture(page, filename) {
  fs.mkdirSync(visualsDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(visualsDirectory, filename),
    type: "jpeg",
    quality: 86,
    fullPage: true,
    animations: "disabled",
  });
}

function walkthroughEmail() {
  // The CI database is created fresh for each integration run. Local runs use a
  // unique address so the walkthrough can be repeated against a persistent DB.
  if (process.env.CI) return "visual-walkthrough@example.com";
  return `visual-walkthrough-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}

test("capture the visual walkthrough using the real frontend and backend", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Make room for/ })).toBeVisible();
  await capture(page, "00-homepage.jpg");

  await page.getByRole("button", { name: /Get started/ }).first().click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();
  await capture(page, "01-registration.jpg");

  await page.getByRole("button", { name: /Already have an account\? Sign in/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await capture(page, "02-sign-in.jpg");

  await page.getByRole("button", { name: "New here? Create an account" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByLabel("Name").fill("Visual Guide User");
  await page.getByLabel("Email").fill(walkthroughEmail());
  await page.getByLabel("Password").fill("visual-walkthrough-password-123");
  await page.getByRole("button", { name: "Create workspace" }).click();

  await expect(page.getByRole("heading", { name: /Good morning/ })).toBeVisible();
  await expect(page.locator(".stats")).toBeVisible();
  await capture(page, "03-workspace-overview.jpg");

  const nav = page.locator(".sidebar nav").first();
  await nav.getByRole("button", { name: "Audience", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Audience", exact: true })).toBeVisible();
  await page.getByPlaceholder("New audience name").fill("Visual Walkthrough Audience");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: /Visual Walkthrough Audience/ })).toBeVisible();

  await page.getByPlaceholder("Email").fill("contact.visual@example.com");
  await page.getByPlaceholder("First name").fill("Taylor");
  await page.getByPlaceholder("Last name").fill("Morgan");
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("contact.visual@example.com", { exact: true })).toBeVisible();

  // Read the new records back through the actual backend, not a stubbed response.
  const audienceReadback = await page.evaluate(async () => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/audiences", { credentials: "include" });
    return { ok: response.ok, items: await response.json() };
  });
  expect(audienceReadback.ok).toBeTruthy();
  const storedAudience = audienceReadback.items.find(item => item.name === "Visual Walkthrough Audience");
  expect(storedAudience).toBeTruthy();
  expect(storedAudience.contact_count).toBe(1);

  const contactReadback = await page.evaluate(async audienceId => {
    const response = await fetch(
      "http://127.0.0.1:8000/api/v1/audiences/" + audienceId + "/contacts",
      { credentials: "include" }
    );
    return { ok: response.ok, items: await response.json() };
  }, storedAudience.id);
  expect(contactReadback.ok).toBeTruthy();
  expect(contactReadback.items).toHaveLength(1);
  expect(contactReadback.items[0].email).toBe("contact.visual@example.com");
  await capture(page, "04-audience-and-contacts.jpg");

  await nav.getByRole("button", { name: "Templates", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Templates", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "New template" }).click();
  await page.getByLabel("Template name").fill("Visual Walkthrough Template");
  await page.getByLabel("Template subject").fill("A thoughtful update for {{first_name}}");
  await page.getByLabel("Template HTML").fill("<p>Hello {{first_name}},</p><p>Here is the latest news from our team.</p>");
  await page.getByRole("button", { name: "Save template" }).click();
  await expect(page.getByText("Visual Walkthrough Template", { exact: true })).toBeVisible();

  const templateReadback = await page.evaluate(async () => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/templates", { credentials: "include" });
    return { ok: response.ok, items: await response.json() };
  });
  expect(templateReadback.ok).toBeTruthy();
  expect(templateReadback.items.some(item => item.name === "Visual Walkthrough Template")).toBeTruthy();
  await capture(page, "05-reusable-templates.jpg");

  await nav.getByRole("button", { name: "Campaigns", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Campaigns", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "New campaign" }).click();
  await expect(page.locator("form.editor")).toBeVisible();
  await page.getByLabel("Start from template").selectOption({ label: "Visual Walkthrough Template" });
  await page.getByLabel("Campaign name").fill("Visual Walkthrough Campaign");
  const audienceSelect = page.locator("form.editor").getByLabel("Audience");
  const audienceOption = audienceSelect.locator("option").filter({ hasText: "Visual Walkthrough Audience" });
  const audienceId = await audienceOption.getAttribute("value");
  expect(audienceId).toBeTruthy();
  await audienceSelect.selectOption(audienceId);
  await expect(page.getByLabel("Subject")).toHaveValue("A thoughtful update for {{first_name}}");
  await capture(page, "06-campaign-builder.jpg");

  await page.getByRole("button", { name: "Save campaign" }).click();
  const campaignRow = page.locator(".campaign-row").filter({ hasText: "Visual Walkthrough Campaign" });
  await expect(campaignRow).toBeVisible();
  await expect(campaignRow).toContainText("draft");

  const campaignReadback = await page.evaluate(async () => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/campaigns", { credentials: "include" });
    return { ok: response.ok, items: await response.json() };
  });
  expect(campaignReadback.ok).toBeTruthy();
  const storedCampaign = campaignReadback.items.find(item => item.name === "Visual Walkthrough Campaign");
  expect(storedCampaign).toBeTruthy();
  expect(storedCampaign.status).toBe("draft");
  await capture(page, "07-saved-campaign.jpg");

  await nav.getByRole("button", { name: "Analytics", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
  await expect(page.locator(".analytics-grid")).toBeVisible();
  await expect(page.locator(".analytics-grid .stat").first().locator("strong")).toHaveText("0");
  await capture(page, "08-analytics.jpg");
});
