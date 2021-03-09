const puppeteer = require('puppeteer');
const user = require('./login.json');

const perfil = "stonedyoda";

const siteDetails = {
  pageurl:
    `https://www.instagram.com/${perfil}/`,
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

  await page.type('input[name="username"]', user.user);
  await page.type('input[name="password"]', user.pass);

  await page.click('button[type="submit"]');

  await Promise.all([
    page.waitForNavigation({
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    }),
  ]);

  const existSection = await page.$(".ABCxa");

  if (existSection) {
    const buttonClose = await page.$("button[type='button']");
    await buttonClose.click()
  }

  await openFollowers(page, false, '.-nal3');
  getFollowers(page, '.FPmhX.notranslate')

})();


async function openFollowers(page, firstTime, selector) {

  await Promise.all([
    page.waitForNavigation({
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    }),
    firstTime ? page.goto(
      siteDetails.pageurl
    ) : null,
    page.waitForSelector(selector, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    }),
  ]);

  await page.evaluate((selector) => {
    const followButton = document.querySelectorAll(selector)[1];
    followButton.click();
  }, selector);

}

async function getFollowers(page, selector) {
  await Promise.all([
    page.waitForSelector(selector, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    }),
  ]);

  await page.evaluate(async (selector) => {
    let followers = [];
    const followersList = Array.from(document.querySelectorAll(selector));
    followersList.forEach(follower => {
      if (followers.length == 0) {
        followers.push(follower.innerText)
      }
      followers = followers.filter(f => f != follower.innerText).map(data => data.innerText);
    });

  }, selector);

}