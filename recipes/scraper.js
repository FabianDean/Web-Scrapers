const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhoneX = devices['iPhone X'];

const url = 'https://example.com';

const run = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // devtools: true,
    });
    const page = await browser.newPage();
    /* Emulating mobile because Food Network's Trending Recipes page is easier to scrape this way. */
    await page.emulate(iPhoneX);
    await page.goto(url);

    await page.waitFor(3000);
    await page.evaluate(() => {
        document.querySelector('a').click();
    });
    await page.waitFor(2000);
    await page.evaluate(() => { alert('It worked!') });
    await page.waitFor(5000);
    browser.close();
}

run();