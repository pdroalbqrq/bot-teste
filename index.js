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

async function login(page, { user, pass }) {
  await page.type('input[name="username"]', user);
  await page.type('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await acceptToStoreUser(page)
}

async function acceptToStoreUser(page) {
  await page.waitForNavigation({
    waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
  });

  const existSection = await page.$(".ABCxa");
  if (existSection) {
    const buttonClose = await page.$("button[type='button']");
    await buttonClose.click()
  }
}

async function openFollowers(page, firstTime, selector) {
  await waitPageToLoad(page, firstTime, selector);
  page.evaluate((selector) => {
    const followButton = document.querySelectorAll(selector)[1];
    followButton.click();
  }, selector);
}

async function getFollowers(page, selector) {
  return await page.$$eval(selector, (usersList) => {
    return usersList.map(user => user.innerText)
  });
}

async function loadMoreFollowers(page, browser, randomNumber) {
  await waitPageToLoad(page, false, '.FPmhX.notranslate');
  let users = [];
  const interval = await setInterval(async () => {
    await page.$eval('.isgrP', (el) => el.scrollBy(0, el.scrollHeight));
    users = await getFollowers(page, '.FPmhX.notranslate');
    if (users.length >= randomNumber) {
      clearInterval(interval);
      const pageFollowerProfile = await browser.newPage();
      await pageFollowerProfile.goto(siteDetails.pageurl(users[0]))
    }
    console.log(users.length)
  }, 500)
}

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