const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function main() {
  const screenshotsDir = path.join(__dirname, "..", "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log("Iniciando navegador Playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // 1. Landing Page
  console.log("1. Capturando Landing Page...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, "01_landing_page.png"), fullPage: false });

  // 2. Login Page
  console.log("2. Capturando Tela de Login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, "02_login_page.png"), fullPage: false });

  // 3. Dashboard do Treinador
  console.log("3. Efetuando login como Treinador e capturando Dashboard...");
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "trainer@test.com");
  await page.fill('input[type="password"]', "123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/trainer/dashboard", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, "03_trainer_dashboard.png"), fullPage: false });

  // 4. Dashboard do Aluno
  console.log("4. Efetuando login como Aluno e capturando Dashboard/Gamificação...");
  await context.clearCookies();
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "student@test.com");
  await page.fill('input[type="password"]', "123456");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/student/dashboard", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, "04_student_dashboard.png"), fullPage: false });

  console.log("Todas as 4 capturas de tela foram concluídas com sucesso!");
  await browser.close();
}

main().catch((err) => {
  console.error("Erro durante a captura de telas:", err);
  process.exit(1);
});
