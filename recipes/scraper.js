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

    // trendingRecipes = await getTrending(page);
    // console.log(trendingRecipes);
    // https://www.foodnetwork.com/recipes/anne-burrell/lasagna-recipe-1952672
    // https://www.foodnetwork.com/recipes/food-network-kitchen/hamburgers-recipe2-2040357
    const recipe = await getRecipeDetails('https://www.foodnetwork.com/recipes/food-network-kitchen/hamburgers-recipe2-2040357', page);
    console.log(recipe);


    browser.close();
}

/**
 * @function getRecipeDetails()
 * @param {string} url 
 * @param {Page} page
 * @return Recipe as JSON object
 * @summary Takes in recipe url and page to extract its information
 */
const getRecipeDetails = async (url, page) => {
    await page.goto(url, {
        waitUntil: "domcontentloaded"
    });
    return await page.evaluate(() => {
        let ingredients = [];
        let directions = [];
        const recipeBlock = document.querySelector('.o-Recipe');
        let title = recipeBlock.querySelector('.o-AssetTitle__a-HeadlineText').textContent;
        let imageURL = recipeBlock.querySelector('.m-MediaBlock__a-Image').getAttribute('src').substr(2);
        let level = document.evaluate("//span[contains(text(),'Level:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue.parentElement.children[1].textContent;
        let servings = document.evaluate("//span[contains(text(),'Yield:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue.parentElement.children[1].textContent;
        let totalTime = recipeBlock.querySelector('#mod-recipe-lead-1 > div.recipeInfo > div > ul.o-RecipeInfo__m-Time > li:nth-child(1) > span.o-RecipeInfo__a-Description.m-RecipeInfo__a-Description--Total')
            .textContent.trim();
        recipeBlock.querySelectorAll('.o-Ingredients__a-Ingredient')
            .forEach(item => {
                ingredients.push(item.textContent); // adds to beginning of ingredients array
            });
        recipeBlock.querySelector('#mod-recipe-method-1 > div > ol:nth-child(1)').querySelectorAll('li')
            .forEach((child) => {
                directions.push(child.textContent.trim());
            });

        return {
            title: title,
            imageURL: imageURL,
            level: level,
            servings: servings,
            totalTime: totalTime,
            ingredients: ingredients,
            directions: directions
        };
    });
}

/** 
 * @function getTrending()
 * @param page
 * @summary Takes in the Trending Recipes page from the Food Network's site and returns the recipes.
 * @returns Array of recipes as JSON objects
*/
const getTrending = async (page) => {
    return await page.evaluate(() => {
        let data = [];
        document.querySelectorAll('.o-PhotoGalleryPromo__m-MediaBlock').forEach(async (item) => {
            item.querySelector('.more').click();
            const title = item.querySelector('.o-PhotoGalleryPromo__a-HeadlineText')
                .textContent.replace(/No\.\s[0-9][0-9]*\:\s/, '');
            const description = item.querySelector('.originalText')
                .textContent.replace(' ... less', '');
            const imageURL = item.querySelector('.m-MediaBlock__a-Image')
                .getAttribute('src').substr(2);
            const recipeURL = item.querySelector('div.m-MediaBlock__m-TextWrap > section > p > a')
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

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

run();