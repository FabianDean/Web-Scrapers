const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhoneX = devices['iPhone X'];

const url = 'https://www.foodnetwork.com/recipes/photos/our-10-most-popular-recipes-right-now.com';

/* Food Network Search Endpoint
    foodnetwork.com/search/<query>-
*/

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
    
    trendingRecipes = await getTrending(page);

    console.log(trendingRecipes);

    browser.close();
}

const getTrending = async (page) => {
    return await page.evaluate(() => {
        let data = [];
        document.querySelectorAll('.o-PhotoGalleryPromo__m-MediaBlock').forEach(async (item) => {
            await item.querySelector('.more').click();
            const title = await item.querySelector('.o-PhotoGalleryPromo__a-HeadlineText')
                .textContent.replace(/No\.\s[0-9][0-9]*\:\s/, '');
            const description = await item.querySelector('.originalText')
                .textContent.replace(' ... less', '');
            const imageURL = await item.querySelector('.m-MediaBlock__a-Image')
                .getAttribute('src').substr(2);
            const recipeURL = await item.querySelector('div.m-MediaBlock__m-TextWrap > section > p > a')
                .getAttribute('href').substr(2);
            data.push({
                title: title,
                description: description,
                imageURL: imageURL,
                recipeURL: recipeURL
            });
        });
        return data;
    });
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