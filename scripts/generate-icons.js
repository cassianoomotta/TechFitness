const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logoPath = path.resolve(__dirname, '../public/logo.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  // 1. icon-192.png (192x192, purpose: any)
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 192px;
            height: 192px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <img src="${logoSrc}" alt="TechFitness" />
      </body>
    </html>
  `);
  await page.screenshot({
    path: path.resolve(__dirname, '../public/icons/icon-192.png'),
    type: 'png',
  });
  console.log('Generated icon-192.png');

  // 2. icon-512.png (512x512, purpose: any)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <img src="${logoSrc}" alt="TechFitness" />
      </body>
    </html>
  `);
  await page.screenshot({
    path: path.resolve(__dirname, '../public/icons/icon-512.png'),
    type: 'png',
  });
  console.log('Generated icon-512.png');

  // 3. maskable-icon-512.png (512x512, purpose: maskable - 80% safe zone with #FFFFFF background)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          img {
            width: 80%;
            height: 80%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${logoSrc}" alt="TechFitness" />
      </body>
    </html>
  `);
  await page.screenshot({
    path: path.resolve(__dirname, '../public/icons/maskable-icon-512.png'),
    type: 'png',
  });
  console.log('Generated maskable-icon-512.png');

  await browser.close();
  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
