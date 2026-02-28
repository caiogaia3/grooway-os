const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://grooway.cloud/login');

    await page.type('input[type="email"]', 'caaiog3@gmail.com');
    await page.type('input[type="password"]', 'Tkog0312@');
    await page.click('button[type="submit"]');

    await page.waitForNavigation();
    console.log("Logged in");

    await page.goto('https://grooway.cloud/auditor');
    console.log("Navigated to auditor");

    await page.waitForSelector('input[name="url"]');
    await page.type('input[name="url"]', 'https://bragofacilities.com.br/');
    await page.type('input[name="companyName"]', 'Brago Facilities');
    await page.type('input[name="city"]', 'Uberaba');
    await page.type('input[name="instagram"]', 'https://www.instagram.com/bragofacilities/');

    // Wait to ensure form picks up changes
    await new Promise(r => setTimeout(r, 2000));

    // Submit the form
    await page.evaluate(() => {
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    console.log("Started analysis. Waiting 15 seconds...");
    await new Promise(r => setTimeout(r, 15000));

    await browser.close();
})();
