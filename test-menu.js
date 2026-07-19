const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://intelligent-lovelace.vercel.app/rest_demo_001/menu/1');
  await page.waitForTimeout(3000);
  const text = await page.locator('.text-red-500').textContent().catch(() => 'NOT FOUND');
  console.log("RED TEXT IS:", text);
  const foods = await page.locator('.grid').innerText().catch(() => 'NO GRID');
  console.log("FOODS:", foods.substring(0, 100));
  await browser.close();
})();
