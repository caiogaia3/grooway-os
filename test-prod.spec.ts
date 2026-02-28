import { test, expect } from '@playwright/test';

test('Run auditor on production', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes timeout
    await page.goto('https://grooway.cloud/login');

    // Login
    await page.fill('input[type="email"]', 'caaiog3@gmail.com');
    await page.fill('input[type="password"]', 'Tkog0312@');
    await page.click('button[type="submit"]');

    // Wait for Dashboard to load
    await expect(page).toHaveURL(/.*dashboard.*/);

    // Go to Auditor
    await page.goto('https://grooway.cloud/auditor');

    // Fill the analysis form
    await page.fill('input[name="url"]', 'https://bragofacilities.com.br/');
    await page.fill('input[name="companyName"]', 'Brago Facilities');
    await page.fill('input[name="city"]', 'Uberaba');
    await page.fill('input[name="instagram"]', 'https://www.instagram.com/bragofacilities/');

    // Click Analyze
    await page.click('button:has-text("Iniciar Raio-X")'); // Or whatever the button text is. 'Iniciar' is a safe guess.

    console.log("Started analysis. Waiting for 15 seconds before checking Supabase...");
    await page.waitForTimeout(15000);
});
