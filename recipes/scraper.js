const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhoneX = devices['iPhone X'];

const url = 'https://www.foodnetwork.com/recipes/photos/our-10-most-popular-recipes-right-now.com';

const run = async () => {
    let trendingRecipes = [];

    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
    });
    const page = await browser.newPage();
    await page.emulate(iPhoneX);
    await page.goto(url, {
        waitUntil: "domcontentloaded"
    });
    
    await page.waitForXPath('//*[@id="mod-vertical-gallery-1"]/div');
    trendingRecipes = await page.evaluate(() => {
        let data = [];
        document.querySelectorAll('.o-PhotoGalleryPromo__m-MediaBlock').forEach(async (item) => {
            await item.querySelector('.more').click();
            const title = await item.querySelector('.o-PhotoGalleryPromo__a-HeadlineText');
            const description = await item.querySelector('.originalText');
            const imageURL = await item.querySelector('.m-MediaBlock__a-Image').getAttribute('src');
            data.push({
                imageURL: imageURL,
                title: title.textContent.replace(/No\.\s[0-9][0-9]*\:\s/, ''),
                description: description.textContent.replace(' ... less', '')
            });
        });
        return data;
    });

    console.log(trendingRecipes);

    browser.close();
}

const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

run();