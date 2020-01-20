const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhoneX = devices['iPhone X'];

/* Food Network Search Endpoint
    foodnetwork.com/search/<query>-/CUSTOM_FACET:RECIPE_FACET
*/
class RecipeScraper {
    constructor() {
        puppeteer.launch({
            headless: true
        })
        .then((b) => {
            this.browser = b;
            console.log('RecipeScraper initialized.')
        })
        .catch(err => { console.log('Error in constructor')})
    }

    async close() {
        await browser.close();
    }

    /**
     * @param {string} query 
     * @return List of recipes
     * @summary Takes in a recipe query and returns list of recipes and their URLs 
     */
    async searchRecipe(query) {
        const page = await browser.newPage();
        await page.goto('https://foodnetwork.com/search/' + query.replace(' ', '-') + '/CUSTOM_FACET:RECIPE_FACET', {
            waitUntil: 'domcontentloaded'
        });
        const recipes = await page.evaluate(() => {
            let data = [];
            document.querySelectorAll('.o-RecipeResult o-ResultCard').forEach(async (item) => {
                const title = item.querySelector('.o-ResultCard__a-HeadlineText').textContent;
                const imageURL = item.querySelector('.m-MediaBlock__a-Image')
                    .getAttribute('src').substr(2);
                const recipeURL = item.querySelector('.o-ResultCard__a-Headline > a')
                    .getAttribute('href').substr(2);
                data.push({
                    title: title,
                    imageURL: imageURL,
                    recipeURL: recipeURL
                });
            });
            return data;
        });
        await page.close();
        return recipes;
    }

    /**
     * @param {string} url 
     * @return Recipe as JSON object
     * @summary Takes in recipe url and page to extract its information
     */
    async getRecipeDetails(url) {
        const page = await browser.newPage();
        await page.goto(url, {
            waitUntil: "domcontentloaded"
        });
        const recipe = await page.evaluate(() => {
            let ingredients = [];
            let directions = [];
            const recipeBlock = document.querySelector('.o-Recipe');
            const title = recipeBlock.querySelector('.o-AssetTitle__a-HeadlineText').textContent;
            const imageURL = recipeBlock.querySelector('.m-MediaBlock__a-Image').getAttribute('src').substr(2);
            const level = document.evaluate("//span[contains(text(),'Level:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue.parentElement.children[1].textContent;
            const servings = document.evaluate("//span[contains(text(),'Yield:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue.parentElement.children[1].textContent;
            const totalTime = recipeBlock.querySelector('#mod-recipe-lead-1 > div.recipeInfo > div > ul.o-RecipeInfo__m-Time > li:nth-child(1) > span.o-RecipeInfo__a-Description.m-RecipeInfo__a-Description--Total')
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
        await page.close();
        return recipe;
    }

    /** 
     * @summary Takes in the Trending Recipes page from the Food Network's site and returns the recipes.
     * @returns Array of recipes as JSON objects
    */
    getTrending = async () => {
        const url = 'https://www.foodnetwork.com/recipes/photos/our-10-most-popular-recipes-right-now.com';
        const page = await this.browser.newPage();
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        })
        const recipes = await page.evaluate(() => {
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
        await page.close();
        return recipes;
    }
}

const run = async () => {
    const scraper = new RecipeScraper();
    console.log(scraper.getTrending());
    scraper.close();
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