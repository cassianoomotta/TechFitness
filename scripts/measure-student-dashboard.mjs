import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const RUN_COUNT = 3;
const DEFAULT_CREDENTIALS_FILE = "test-credentials.json";
const REPORT_PATH = "docs/performance/2026-10-13-student-dashboard-baseline.md";
const REQUEST_TIMEOUT_MS = 60_000;

const SAFE_API_ROUTES = new Set([
  "/api/auth/session",
  "/api/user/profile",
  "/api/student/workout-plans",
  "/api/student/gamification",
  "/api/student/ranking",
  "/api/student/photo-feed",
  "/api/student/groups",
  "/api/student/groups/timeline",
  "/api/trainer/students",
  "/api/trainer/stats",
]);

export function summarizeDurations(values) {
  const durations = values.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  const medianMs = durations.length === 0
    ? 0
    : durations.length % 2 === 0
      ? (durations[middle - 1] + durations[middle]) / 2
      : durations[middle];

  return {
    count: durations.length,
    medianMs: Math.round(medianMs),
    minMs: durations[0] ?? 0,
    maxMs: durations.at(-1) ?? 0,
  };
}

export function safeRouteLabel(value) {
  let pathname;
  try {
    pathname = new URL(value, "http://localhost").pathname;
  } catch {
    return "/api/:rota";
  }

  if (SAFE_API_ROUTES.has(pathname)) return pathname;

  const workoutSessionMatch = pathname.match(/^\/api\/student\/workout-sessions\/[^/]+\/(photo)$/);
  if (workoutSessionMatch) return `/api/student/workout-sessions/:id/${workoutSessionMatch[1]}`;

  const studentMatch = pathname.match(/^\/api\/student\/workout-plans\/[^/]+\/(archive|request-deletion)$/);
  if (studentMatch) return `/api/student/workout-plans/:id/${studentMatch[1]}`;

  const groupMatch = pathname.match(/^\/api\/student\/groups\/[^/]+\/(leave|members)$/);
  if (groupMatch) return `/api/student/groups/:id/${groupMatch[1]}`;

  return pathname.startsWith("/api/") ? "/api/:rota" : "/:rota";
}

export function safeDiagnosticMessage(value) {
  return String(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/https?:\/\/[^\s]+/gi, "[url]");
}

function parseArguments(args) {
  const parsed = { flow: "student-home", failRoute: null };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--flow") {
      parsed.flow = args[index + 1];
      index += 1;
    } else if (argument === "--fail-route") {
      parsed.failRoute = args[index + 1];
      index += 1;
    }
  }

  if (!["student-home", "trainer-stats", "groups-timeline"].includes(parsed.flow)) {
    throw new Error("Fluxo inválido. Use student-home, trainer-stats ou groups-timeline.");
  }
  if (parsed.failRoute !== null && !["ranking", "photo-feed"].includes(parsed.failRoute)) {
    throw new Error("Rota de falha inválida. Use ranking ou photo-feed.");
  }
  if (parsed.failRoute !== null && parsed.flow !== "student-home") {
    throw new Error("A simulação de falha está disponível somente no fluxo student-home.");
  }

  return parsed;
}

async function loadCredentials(flow) {
  const content = await readFile(DEFAULT_CREDENTIALS_FILE, "utf8");
  const credentials = JSON.parse(content);
  const role = flow === "trainer-stats"
    ? "professor"
    : "aluno";
  const account = credentials?.contas?.[role];

  if (typeof account?.email !== "string" || typeof account?.senha !== "string") {
    throw new Error("A conta oficial de teste não foi encontrada em test-credentials.json.");
  }

  const configuredUrl = process.env.TECHFITNESS_BASE_URL || account.login_url;
  const baseUrl = new URL(configuredUrl);
  return {
    email: account.email,
    password: account.senha,
    baseUrl: baseUrl.origin,
    role,
  };
}

function launchBrowser() {
  return chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
}

function attachRequestTracking(page) {
  const starts = new WeakMap();
  const requests = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/")) {
      starts.set(request, performance.now());
    }
  });
  page.on("response", (response) => {
    const request = response.request();
    const startedAt = starts.get(request);
    if (startedAt === undefined) return;

    const contentLength = Number(response.headers()["content-length"]);
    requests.push({
      route: safeRouteLabel(response.url()),
      durationMs: Math.round(performance.now() - startedAt),
      status: response.status(),
      payloadBytes: Number.isFinite(contentLength) && contentLength > 0 ? contentLength : null,
    });
  });
  page.on("requestfailed", (request) => {
    const startedAt = starts.get(request);
    if (startedAt === undefined) return;
    requests.push({
      route: safeRouteLabel(request.url()),
      durationMs: Math.round(performance.now() - startedAt),
      status: "falha",
      payloadBytes: null,
    });
  });
  return requests;
}

async function login(page, account) {
  await page.goto(new URL("/login", account.baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.locator('button[type="submit"]').click();
  const expectedPath = account.role === "professor" ? "/trainer/dashboard" : "/student/dashboard";
  const loginResult = await Promise.race([
    page.waitForURL((url) => url.pathname === expectedPath, { timeout: REQUEST_TIMEOUT_MS }).then(() => "autenticado"),
    page.getByText("E-mail ou senha incorretos.", { exact: true })
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => "credencial-recusada"),
  ]);
  if (loginResult !== "autenticado") {
    if (process.env.TF_PERF_DEBUG === "1") {
      const knownCredentialError = await page.getByText("E-mail ou senha incorretos.", { exact: true })
        .isVisible().catch(() => false);
      console.error(`Login recusado ou sem redirecionamento. Página: ${new URL(page.url()).pathname}. Retorno: ${knownCredentialError ? "credenciais inválidas" : "sem mensagem de credenciais conhecida"}`);
    }
    throw new Error("A conta oficial de teste não foi aceita pelo servidor configurado.");
  }
}

async function clearStudentDashboardCache(page) {
  await page.evaluate(() => {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith("tf_st_")) window.sessionStorage.removeItem(key);
    }
  });
  await page.goto("about:blank");
}

async function measureStudentHome(page, account, options) {
  const startedAt = performance.now();
  const rankingPath = "/api/student/ranking";
  const photoFeedPath = "/api/student/photo-feed";
  const rankingResponse = options.requireNetworkResponse ? page.waitForResponse(
    (response) => new URL(response.url()).pathname === rankingPath,
    { timeout: REQUEST_TIMEOUT_MS }
  ).then((response) => ({ response, arrivedAt: performance.now() })).catch(() => null) : Promise.resolve(null);
  const photoFeedResponse = options.requireNetworkResponse ? page.waitForResponse(
    (response) => new URL(response.url()).pathname === photoFeedPath,
    { timeout: REQUEST_TIMEOUT_MS }
  ).then((response) => ({ response, arrivedAt: performance.now() })).catch(() => null) : Promise.resolve(null);
  if (options.failRoute) {
    const failedPath = options.failRoute === "ranking" ? rankingPath : photoFeedPath;
    await page.route(`**${failedPath}`, (route) => route.abort("failed"));
  }

  await page.goto(new URL("/student/dashboard", account.baseUrl).toString(), { waitUntil: "domcontentloaded" });
  const rankingHeading = page.getByText("Liga dos Titãs", { exact: true });
  const photoHeading = page.getByText("Check-ins da Turma (Fotos da Semana)", { exact: true });
  const rankingFailure = page.getByText("Não foi possível carregar a classificação agora.", { exact: false });
  const photoFailure = page.getByText("Não foi possível carregar o mural de fotos.", { exact: true });
  const photoLoading = page.getByText("Carregando fotos da turma...", { exact: true });
  const rankingVisualReady = (options.failRoute === "ranking"
    ? rankingFailure.waitFor({ state: "visible", timeout: REQUEST_TIMEOUT_MS })
    : rankingHeading.waitFor({ state: "visible", timeout: REQUEST_TIMEOUT_MS }))
    .then(() => Math.round(performance.now() - startedAt));
  const photoFeedVisualReady = (options.failRoute === "photo-feed"
    ? photoFailure.waitFor({ state: "visible", timeout: REQUEST_TIMEOUT_MS })
    : Promise.all([
        photoHeading.waitFor({ state: "visible", timeout: REQUEST_TIMEOUT_MS }),
        photoLoading.waitFor({ state: "hidden", timeout: REQUEST_TIMEOUT_MS }),
      ]))
    .then(() => Math.round(performance.now() - startedAt));
  const [rankingObservation, photoFeedObservation, rankingVisualReadyMs, photoFeedVisualReadyMs] = await Promise.all([
    options.failRoute === "ranking" ? Promise.resolve(null) : rankingResponse,
    options.failRoute === "photo-feed" ? Promise.resolve(null) : photoFeedResponse,
    rankingVisualReady,
    photoFeedVisualReady,
  ]);
  const response = rankingObservation?.response ?? null;
  const photoResponse = photoFeedObservation?.response ?? null;
  const rankingReadyMs = Math.max(
    rankingVisualReadyMs,
    rankingObservation ? Math.round(rankingObservation.arrivedAt - startedAt) : 0,
  );
  const photoFeedReadyMs = Math.max(
    photoFeedVisualReadyMs,
    photoFeedObservation ? Math.round(photoFeedObservation.arrivedAt - startedAt) : 0,
  );

  if (options.requireNetworkResponse && !options.failRoute &&
      (!response || !response.ok() || !photoResponse || !photoResponse.ok())) {
    if (process.env.TF_PERF_DEBUG === "1") {
      console.error(`Respostas da página inicial: ranking=${response?.status() ?? "sem resposta"}, mural=${photoResponse?.status() ?? "sem resposta"}.`);
    }
    throw new Error("A classificação não respondeu com sucesso.");
  }

  if (options.failRoute) {
    const otherSectionVisible = options.failRoute === "ranking"
      ? await photoHeading.isVisible().catch(() => false) && !await photoFailure.isVisible().catch(() => false)
      : await rankingHeading.isVisible().catch(() => false);
    const isolatedErrorVisible = options.failRoute === "ranking"
      ? await rankingFailure.isVisible().catch(() => false)
      : await photoFailure.isVisible().catch(() => false);
    if (!isolatedErrorVisible || !otherSectionVisible) {
      throw new Error(`Falha isolada em ${options.failRoute} não preservou a outra seção.`);
    }
  }

  return {
    rankingReadyMs,
    photoFeedReadyMs,
    contentReadyMs: Math.max(rankingReadyMs, photoFeedReadyMs),
    rankingVisible: await rankingHeading.isVisible().catch(() => false),
    photoFeedVisible: await photoHeading.isVisible().catch(() => false),
  };
}

async function measureTrainerStats(page, account, options) {
  const startedAt = performance.now();
  const statsResponse = options.requireNetworkResponse ? page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/trainer/stats",
    { timeout: REQUEST_TIMEOUT_MS }
  ).catch(() => null) : Promise.resolve(null);
  await page.goto(new URL("/trainer/dashboard", account.baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await Promise.all([
    page.getByText("Frequência Mensal", { exact: true })
      .locator("xpath=../..")
      .locator("svg.animate-spin")
      .waitFor({ state: "detached", timeout: REQUEST_TIMEOUT_MS }),
    page.getByText("Recordes Batidos", { exact: true })
      .locator("xpath=../..")
      .locator("svg.animate-spin")
      .waitFor({ state: "detached", timeout: REQUEST_TIMEOUT_MS }),
  ]);
  const contentReadyMs = Math.round(performance.now() - startedAt);
  const response = await statsResponse;
  if (options.requireNetworkResponse && (!response || !response.ok())) {
    throw new Error("O endpoint de estatísticas do treinador não respondeu com sucesso.");
  }
  return { contentReadyMs };
}

async function measureGroupsTimeline(page, account, options) {
  const startedAt = performance.now();
  const timelineResponse = options.requireNetworkResponse ? page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/student/groups/timeline",
    { timeout: REQUEST_TIMEOUT_MS }
  ).catch(() => null) : Promise.resolve(null);
  await page.goto(new URL("/student/dashboard", account.baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Grupos", exact: true }).click();
  await page.getByText("Mural de Fotos de Treino", { exact: true })
    .waitFor({ state: "visible", timeout: REQUEST_TIMEOUT_MS });
  const timelineLoading = page.getByText("Sincronizando mural da comunidade...", { exact: true });
  await timelineLoading.waitFor({ state: "visible", timeout: REQUEST_TIMEOUT_MS });
  await timelineLoading.waitFor({ state: "hidden", timeout: REQUEST_TIMEOUT_MS });
  const response = await timelineResponse;
  if (options.requireNetworkResponse && (!response || !response.ok())) {
    throw new Error("A linha do tempo dos grupos não respondeu com sucesso.");
  }
  const contentReadyMs = Math.round(performance.now() - startedAt);
  return { contentReadyMs };
}

async function measureFlow(page, account, flow, options) {
  if (flow === "student-home") return measureStudentHome(page, account, options);
  if (flow === "trainer-stats") return measureTrainerStats(page, account, options);
  return measureGroupsTimeline(page, account, options);
}

function summarizeRequests(runs) {
  const byRoute = new Map();
  for (const run of runs) {
    for (const request of run.requests) {
      const routeData = byRoute.get(request.route) || { durations: [], payloads: [], requests: 0, failures: 0 };
      routeData.requests += 1;
      if (request.status === "falha" || (typeof request.status === "number" && request.status >= 400)) {
        routeData.failures += 1;
      }
      routeData.durations.push(request.durationMs);
      if (request.payloadBytes !== null) routeData.payloads.push(request.payloadBytes);
      byRoute.set(request.route, routeData);
    }
  }
  return [...byRoute.entries()].map(([route, values]) => ({
    route,
    requests: values.requests,
    failures: values.failures,
    ...summarizeDurations(values.durations),
    medianPayloadBytes: summarizeDurations(values.payloads).medianMs,
  })).sort((left, right) => left.route.localeCompare(right.route));
}

export function buildReport(flow, runs) {
  const contentSummary = summarizeDurations(runs.map((run) => run.contentReadyMs));
  const coldRuns = runs.filter((run) => run.kind === "fria");
  const warmRuns = runs.filter((run) => run.kind === "aquecida");
  const coldContentSummary = summarizeDurations(coldRuns.map((run) => run.contentReadyMs));
  const warmContentSummary = summarizeDurations(warmRuns.map((run) => run.contentReadyMs));
  const requestRows = summarizeRequests(runs);
  const lines = [
    `## ${flow}`,
    "",
    `- Execuções: ${runs.length} (${runs.filter((run) => run.kind === "fria").length} frias e ${runs.filter((run) => run.kind === "aquecida").length} aquecidas).`,
    `- Conteúdo principal: mediana ${contentSummary.medianMs} ms, mínimo ${contentSummary.minMs} ms, máximo ${contentSummary.maxMs} ms.`,
    `- Conteúdo pronto em execução fria: mediana ${coldContentSummary.medianMs} ms, mínimo ${coldContentSummary.minMs} ms, máximo ${coldContentSummary.maxMs} ms.`,
    `- Conteúdo pronto em execução aquecida: mediana ${warmContentSummary.medianMs} ms, mínimo ${warmContentSummary.minMs} ms, máximo ${warmContentSummary.maxMs} ms.`,
  ];
  if (flow === "student-home") {
    const rankingSummary = summarizeDurations(runs.map((run) => run.rankingReadyMs));
    const photoFeedSummary = summarizeDurations(runs.map((run) => run.photoFeedReadyMs));
    const coldRankingSummary = summarizeDurations(coldRuns.map((run) => run.rankingReadyMs));
    const warmRankingSummary = summarizeDurations(warmRuns.map((run) => run.rankingReadyMs));
    const coldPhotoFeedSummary = summarizeDurations(coldRuns.map((run) => run.photoFeedReadyMs));
    const warmPhotoFeedSummary = summarizeDurations(warmRuns.map((run) => run.photoFeedReadyMs));
    lines.push(
      `- Classificação pronta: mediana ${rankingSummary.medianMs} ms, mínimo ${rankingSummary.minMs} ms, máximo ${rankingSummary.maxMs} ms.`,
      `- Mural de fotos pronto: mediana ${photoFeedSummary.medianMs} ms, mínimo ${photoFeedSummary.minMs} ms, máximo ${photoFeedSummary.maxMs} ms.`,
      `- Classificação em execução fria: mediana ${coldRankingSummary.medianMs} ms; aquecida: ${warmRankingSummary.medianMs} ms.`,
      `- Mural de fotos em execução fria: mediana ${coldPhotoFeedSummary.medianMs} ms; aquecida: ${warmPhotoFeedSummary.medianMs} ms.`,
    );
  }
  lines.push(
    "",
    "| Rota | Chamadas | Falhas | Mediana | Mínimo | Máximo | Payload mediano |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  );

  for (const row of requestRows) {
    lines.push(`| \`${row.route}\` | ${row.requests} | ${row.failures} | ${row.medianMs} ms | ${row.minMs} ms | ${row.maxMs} ms | ${row.medianPayloadBytes || "indisponível"} bytes |`);
  }
  if (requestRows.length === 0) lines.push("| Nenhuma rota de API observada | 0 | 0 | indisponível | indisponível | indisponível | indisponível | ");
  return lines.join("\n");
}

async function run() {
  const options = parseArguments(process.argv.slice(2));
  const account = await loadCredentials(options.flow);
  if (options.failRoute) {
    const browser = await launchBrowser();
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      await login(page, account);
      await clearStudentDashboardCache(page);
      const result = await measureFlow(page, account, options.flow, { ...options, requireNetworkResponse: true });
      console.log(`Falha isolada validada: ${options.failRoute}; classificação visível: ${result.rankingVisible}; mural visível: ${result.photoFeedVisible}.`);
      await context.close();
    } finally {
      await browser.close();
    }
    return;
  }

  const browser = await launchBrowser();
  const runs = [];
  try {
    for (let index = 0; index < RUN_COUNT; index += 1) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await login(page, account);
      await clearStudentDashboardCache(page);
      const requests = attachRequestTracking(page);
      const result = await measureFlow(page, account, options.flow, { ...options, requireNetworkResponse: true });
      runs.push({ ...result, requests, kind: "fria" });
      await context.close();
    }

    const warmContext = await browser.newContext();
    const warmPage = await warmContext.newPage();
    await login(warmPage, account);
    await measureFlow(warmPage, account, options.flow, { ...options, requireNetworkResponse: false });
    const warmRequests = attachRequestTracking(warmPage);
    for (let index = 0; index < RUN_COUNT; index += 1) {
      const beforeCount = warmRequests.length;
      const result = await measureFlow(warmPage, account, options.flow, { ...options, requireNetworkResponse: false });
      runs.push({ ...result, requests: warmRequests.slice(beforeCount), kind: "aquecida" });
    }
    await warmContext.close();
  } finally {
    await browser.close();
  }

  const reportSection = buildReport(options.flow, runs);
  await mkdir("docs/performance", { recursive: true });
  const reportFile = resolve(REPORT_PATH);
  const existingReport = await readFile(reportFile, "utf8").catch(() => "# Medições de desempenho do TechFitness\n\n");
  const sectionPattern = new RegExp(`(^|\\n)## ${options.flow}\\n[\\s\\S]*?(?=\\n## |$)`);
  const nextReport = sectionPattern.test(existingReport)
    ? existingReport.replace(sectionPattern, `$1${reportSection}`)
    : `${existingReport.trimEnd()}\n\n${reportSection}\n`;
  await writeFile(reportFile, nextReport, "utf8");
  console.log(`Medição concluída. Relatório anonimizado salvo em ${REPORT_PATH}.`);
  console.log(reportSection);
}

const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectExecution) {
  run().catch((error) => {
    console.error("Falha na medição. Confira o servidor local, a URL configurada e as contas oficiais de teste.");
    if (process.env.TF_PERF_DEBUG === "1" && error instanceof Error) {
      console.error(`${error.name}: ${safeDiagnosticMessage(error.message.split("\n", 1)[0])}`);
    }
    process.exitCode = 1;
  });
}
