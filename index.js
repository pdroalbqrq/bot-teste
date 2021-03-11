const puppeteer = require('puppeteer');
const user = require('./login.json');

const perfil = "stonedyoda";

const siteDetails = {
  pageurl: (profile) =>
    `https://www.instagram.com/${profile}/`,
};

const chromeOptions = {
  executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  headless: false,
  slowMo: 10,
  defaultViewport: null,
};

(async function main() {
  const browser = await puppeteer.launch(chromeOptions);

  const page = await browser.newPage();
  page.on('console', (consoleObj) => console.log(consoleObj.text()));
  openFollowers(page, true, '.-nal3');
  await page.waitForSelector('input[name="username"]');

  await login(page, user);
  await openFollowers(page, false, '.-nal3');
  await loadMoreFollowers(page, browser, 60);
})();

/**
 * Fill login inputs and press submit button
 * @param {puppeteer.Page} page Puppeteer Page to pass as param to confirmToSaveUser function
 * @param {{user: string, pass: string}} param1 user object with username and password as atributes to login
 * @returns {void}
 */

async function login(page, { user, pass }) {
  await page.type('input[name="username"]', user);
  await page.type('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await confirmToSaveUser(page)
}

/**
 * Called after login to save account
 * @param {puppeteer.Page} page Puppeteer Page to waitForNavigation and find save button
 */

async function confirmToSaveUser(page) {
  await page.waitForNavigation({
    waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
  });

  const existSection = await page.$(".ABCxa");
  if (existSection) {
    const buttonClose = await page.$("button[type='button']");
    await buttonClose.click()
  }
}

/**
 * Open user followers section
 * @param {puppeteer.Page} page Puppeteer Page to evaluate and hangle DOM elements
 * @param {boolean} firstTime To call waitPageToLoad function without navigate page
 * @param {string} selector Followers button HTML Class name
 */

async function openFollowers(page, firstTime, selector) {
  await waitPageToLoad(page, firstTime, selector);
  page.evaluate((selector) => {
    const followButton = document.querySelectorAll(selector)[1];
    followButton.click();
  }, selector);
}

/**
 * Returns a list of all followers that have been loaded
 * @param {puppeteer.Page} page 
 * @param {string} selector 
 * @returns {Promise<string[]>}
 */

async function getFollowers(page, selector) {
  return await page.$$eval(selector, (usersList) => {
    return usersList.map(user => user.innerText)
  });
}

/**
 * Get followers section and scroll bottom to load X (randomNumber) quantity of followers;
 * @param {puppeteer.Page} page Puppeteer Page to handle elements
 * @param {puppeteer.Browser} browser Puppeteer Browser to create new page
 * @param {number} maxFollowersLength Number of followers to be loaded 
 * @returns {Promise}
 */

async function loadMoreFollowers(page, browser, maxFollowersLength) {
  await waitPageToLoad(page, false, '.FPmhX.notranslate');
  let users = [];

  const interval = await setInterval(async () => {
    await page.$eval('.isgrP', (el) => el.scrollBy(0, el.scrollHeight));
    users = await getFollowers(page, '.FPmhX.notranslate');
    if (users.length >= maxFollowersLength) {
      clearInterval(interval);
      await openAndFollowProfiles(browser);
    }
  }, 500)
}

async function openAndFollowProfiles(browser) {
  const pageFollowerProfile = await browser.newPage();
  await pageFollowerProfile.goto(siteDetails.pageurl(users[0]))
}

/**
 * Wait until determinate element (selector) has entirely loaded;
 * @param {puppeteer.Page} page 
 * @param {boolean} firstTime 
 * @param {string} selector 
 * @returns {Promise}
 */

function waitPageToLoad(page, firstTime, selector) {
  return Promise.all([
    page.waitForNavigation({
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    }),
    firstTime ? page.goto(
      siteDetails.pageurl(perfil)
    ) : null,
    page.waitForSelector(selector, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    }),
  ]);
}