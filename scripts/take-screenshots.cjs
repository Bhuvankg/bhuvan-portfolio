const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = path.join(__dirname, '..', 'preview_screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Hero
  await page.screenshot({ path: path.join(outputDir, 'shot_01_hero.png') });
  console.log('Hero captured');

  // 2. About
  await page.evaluate(() => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'shot_02_about.png') });
  console.log('About captured');

  // 3. Skills
  await page.evaluate(() => {
    document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'shot_03_skills.png') });
  console.log('Skills captured');

  // 4. Projects
  await page.evaluate(() => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'shot_04_projects.png') });
  console.log('Projects captured');

  // 5. Journey
  await page.evaluate(() => {
    document.querySelector('#journey')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'shot_05_journey.png') });
  console.log('Journey captured');

  // 6. Contact
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'shot_06_contact.png') });
  console.log('Contact captured');

  // 7. Mobile Viewport (iPhone 14)
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, 'shot_07_mobile_hero.png') });
  console.log('Mobile hero captured');

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
