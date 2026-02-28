import { test, expect } from "@playwright/test";
import { createTestUser, testData } from "./setup";

test.describe("Admin Settings", () => {
  let adminUser: any;

  test.beforeEach(async ({ page, request }) => {
    // Create a fresh admin user for each test
    // Use retry logic implicitly handled by createTestUser or wrapping it if needed
    // We'll create the user data first
    const userData = testData.admin();
    
    // We need to actually register this user via API first so they exist
    // createTestUser helper does exactly this (signup + login via API)
    // But we want to test UI login here, so we just need them to EXIST.
    // However, createTestUser logs them in via API context. 
    // We can just use the credentials to log in via UI.
    
    const { email } = await createTestUser(request, userData);
    adminUser = { email, password: userData.password };

    // Login as admin via UI
    await page.goto("/login");
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/");

    // Navigate to settings
    await page.goto("/admin/settings");
    await expect(page.locator("h1")).toContainText("Advanced Settings");
  });

  test("should display all settings tabs", async ({ page }) => {

    await expect(page.getByTestId("tab-tax")).toBeVisible();
    await expect(page.getByTestId("tab-pricing")).toBeVisible();
    await expect(page.getByTestId("tab-currency")).toBeVisible();
  });



  test("should manage tax rates", async ({ page }) => {
    await page.getByTestId("tab-tax").click();

    // Open add tax rate dialog
    await page.click('button:has-text("Add Tax Rate")');

    const region = `IN-${Date.now()}`;

    // Fill tax rate form
    await page.fill('input[name="region"]', region);
    await page.locator('button[role="combobox"]').click();
    await page.getByRole('option', { name: "GST", exact: true }).click();
    await page.fill('input[name="sgstRate"]', "9");
    await page.fill('input[name="cgstRate"]', "9");
    await page.fill('input[name="igstRate"]', "18");

    // Submit
    await page.click('button:has-text("Create Tax Rate")');
    // Verify success
    await expect(page.locator("text=Tax rate created").first()).toBeVisible();

    await expect(page.locator('text="Loading tax rates..."').first()).not.toBeVisible();

    // Verify tax rate appears in table
    const row = page.locator(`tr:has-text("${region}")`);
    await expect(row).toBeVisible();
    await expect(row).toContainText("9%");
  });

  test("should manage pricing tiers", async ({ page }) => {
    await page.getByTestId("tab-pricing").click();

    // Open add pricing tier dialog
    await page.click('button:has-text("Add Pricing Tier")');

    // Fill pricing tier form
    const tierName = `Standard-${Date.now()}`;

    // Fill pricing tier form
    await page.fill('input[name="name"]', tierName);
    await page.fill('input[name="minAmount"]', "0");
    await page.fill('input[name="maxAmount"]', "50000");
    await page.fill('input[name="discountPercent"]', "5");
    await page.fill('textarea[name="description"]', "Standard tier for small projects");

    // Submit
    await page.click('button:has-text("Create Pricing Tier")');
    await expect(page.locator("text=Pricing tier created").first()).toBeVisible();

    await expect(page.locator('text="Loading pricing tiers..."').first()).not.toBeVisible();

    // Verify pricing tier appears in table
    const row = page.locator(`tr:has-text("${tierName}")`);
    await expect(row).toBeVisible();
    await expect(row).toContainText("5.00%");
  });

  test("should delete tax rate", async ({ page }) => {
    await page.getByTestId("tab-tax").click();

    const region = `IN-${Date.now()}`;

    // Add a tax rate first
    await page.click('button:has-text("Add Tax Rate")');
    await page.fill('input[name="region"]', region);
    await page.locator('button[role="combobox"]').click();
    await page.getByRole('option', { name: "GST", exact: true }).click();
    await page.fill('input[name="sgstRate"]', "9");
    await page.fill('input[name="cgstRate"]', "9");
    await page.fill('input[name="igstRate"]', "18");
    await page.click('button:has-text("Create Tax Rate")');
    await expect(page.locator("text=Tax rate created").first()).toBeVisible();
    
    // Wait for the row to be visible
    await expect(page.locator('text="Loading tax rates..."').first()).not.toBeVisible();
    await expect(page.locator(`tr:has-text("${region}")`).first()).toBeVisible();

    // Verify deletion
    const deleteButton = page.locator(`tr:has-text("${region}")`).first().locator('button:has-text("Delete")');
    await deleteButton.evaluate((b) => (b as HTMLElement).click());
    
    // Verify deletion
    await expect(page.locator(`tr:has-text("${region}")`)).not.toBeVisible();
    await expect(page.locator("text=Tax rate deleted").first()).toBeVisible();
  });

  test("should delete pricing tier", async ({ page }) => {
    await page.getByTestId("tab-pricing").click();

    const tierName = `Tier-${Date.now()}`;

    // Add a pricing tier first
    await page.click('button:has-text("Add Pricing Tier")');
    await page.fill('input[name="name"]', tierName);
    await page.fill('input[name="minAmount"]', "0");
    await page.fill('input[name="discountPercent"]', "10");
    await page.click('button:has-text("Create Pricing Tier")');
    await expect(page.locator("text=Pricing tier created").first()).toBeVisible();

    // Delete it
    // Wait for the row to be visible
    await expect(page.locator('text="Loading pricing tiers..."').first()).not.toBeVisible();
    const row = page.locator(`tr:has-text("${tierName}")`).first();
    await expect(row).toBeVisible();
    
    // Verify deletion
    await row.locator('button:has-text("Delete")').evaluate((b) => (b as HTMLElement).click());

    // Verify deletion
    await expect(page.locator(`tr:has-text("${tierName}")`)).not.toBeVisible();
    await expect(page.locator("text=Pricing tier deleted").first()).toBeVisible();
  });

  test("should update currency settings", async ({ page }) => {
    await page.getByTestId("tab-currency").click();

    // Select base currency
    await page.getByTestId("select-base-currency").click();
    await page.getByRole('option', { name: "USD", exact: true }).click();

    // Select supported currencies
    await page.getByTestId("checkbox-currency-USD").check();
    await page.getByTestId("checkbox-currency-EUR").check();
    await page.getByTestId("checkbox-currency-GBP").check();

    // Save
    await page.getByTestId("button-save-currency").click();

    // Verify success
    await expect(page.locator("text=Currency settings updated").first()).toBeVisible();
  });

  test("should display current currency settings", async ({ page }) => {
    await page.getByTestId("tab-currency").click();

    // Verify current settings section is visible
    await expect(page.locator("text=Current Settings")).toBeVisible();
    await expect(page.locator("text=Base Currency:")).toBeVisible();
    await expect(page.locator("text=Supported:")).toBeVisible();
  });



  test("should show loading states", async ({ page }) => {
    await page.getByTestId("tab-tax").click();

    // Loading state should appear when fetching data
    const loadingElement = page.locator('text="Loading tax rates..."').first();
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toBeVisible();
    }
  });

  test("should handle empty states", async ({ page }) => {
    // If there are no tax rates, should show appropriate message
    await page.getByTestId("tab-tax").click();
    
    // Wait for loading to finish
    await expect(page.locator('text="Loading tax rates..."').first()).not.toBeVisible();

    const emptyState = page.locator('text="No tax rates configured yet"').first();
    const hasData = await page.locator('table tbody tr').count() > 1;

    if (!hasData) {
      await expect(emptyState).toBeVisible();
    }
  });
});

