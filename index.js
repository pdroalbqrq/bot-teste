const puppeteer = require('puppeteer');
const request = require('node-fetch');
const poll = require('promise-poller').default;
const user = require('./login.json');

const siteDetails = {
  pageurl:
    'https://gshow.globo.com/realities/bbb/bbb21/votacao/paredao-bbb21-vote-para-eliminar-arthur-gilberto-ou-karol-conka-838ec4d5-7d17-4263-a335-29e13c3a769b.ghtml',
};

// const width = 1824,
//   height = 2600;
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

  await Promise.all([
    page.waitForNavigation(),
    page.goto(
      'https://login.globo.com/login/6694?url=https://gshow.globo.com/realities/bbb/bbb21/votacao/paredao-bbb21-vote-para-eliminar-arthur-gilberto-ou-karol-conka-838ec4d5-7d17-4263-a335-29e13c3a769b.ghtml&tam=WIDGET'
    ),
    page.waitForSelector('#login', {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    }),
  ]);

  await page.type('#login', user.user);
  await page.type('#password', user.pass);

  const [buttonLogin] = await page.$x("//button[contains(., 'Entrar')]");

  if (buttonLogin) {
    await Promise.all([buttonLogin.click(), page.waitForNavigation()]);
  }

  await page.waitForXPath("//div[contains(., 'Karol Conká')]");

  const reducedClazz = await page.evaluate((page) => {
    let divs = [...document.querySelectorAll('div')];

    return divs.reduce(function (filtered, div) {
      if (div.innerText == 'Karol Conká') {
        filtered.push(div.className);
      }
      return filtered;
    }, []);
  });

  const elements = await reducedClazz
    .map((data) => {
      return page.$('.' + data);
    })
    .reduce(async (previousPromise, nextAsyncFunction) => {
      await previousPromise;
      const result = await nextAsyncFunction;
      return result;
    }, Promise.resolve());

  elements.evaluate((domElement) => {
    domElement.click();
    // etc ...
  });

  // const teste = await page.evaluate((val) => {
  //   let aTags = Array.from(document.querySelectorAll('div'));
  //   var searchText = "Karol Conká";
  //   var found;
  //   console.log(val);
  //   let links = aTags.map(data => {
  //     return data.innerHTML
  //   })
  //   return links;
  // });

  // if (cardKarol) {
  //   await cardKarol.click()
  // }
  // const response = await pollForRequestResults(apiKey, requestId);

  // await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${response}";`);

  // page.click('#register-form button[type=submit]');
})();

// async function initiateCaptchaRequest(apiKey) {
//   const formData = {
//     method: 'userrecaptcha',
//     googlekey: siteDetails.sitekey,
//     key: apiKey,
//     pageurl: siteDetails.pageurl,
//     json: 1
//   };
//   const response = await request.post('http://2captcha.com/in.php', { form: formData });
//   return JSON.parse(response).request;
// }

// async function pollForRequestResults(key, id, retries = 30, interval = 1500, delay = 15000) {
//   await timeout(delay);
//   return poll({
//     taskFn: requestCaptchaResults(key, id),
//     interval,
//     retries
//   });
// }

// function requestCaptchaResults(apiKey, requestId) {
//   const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
//   return async function () {
//     return new Promise(async function (resolve, reject) {
//       const rawResponse = await request.get(url);
//       const resp = JSON.parse(rawResponse);
//       if (resp.status === 0) return reject(resp.request);
//       resolve(resp.request);
//     });
//   }
// }

// const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))
