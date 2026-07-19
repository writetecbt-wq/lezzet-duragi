const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://intelligent-lovelace.vercel.app/garson');
  await page.waitForTimeout(3000);
  const text = await page.locator('.text-red-500').textContent();
  console.log("RED TEXT IS:", text);
  await browser.close();
})();
