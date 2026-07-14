import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'https://gta6-rewards.vercel.app';
const PARALLEL = parseInt(process.env.PARALLEL || '5', 10);
const CYCLES = parseInt(process.env.CYCLES || '200', 10); // 200 cycles * 5 parallel = 1000
const OUTPUT = 'load-test-results.json';

const RESULTS = { ok: 0, errors: [], pages: {}, totalTime: 0 };
const START = Date.now();

const USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // Chrome macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  // Firefox macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
  // Safari macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  // Edge Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  // Mobile Chrome Android
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.83 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S24) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.83 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.118 Mobile Safari/537.36',
  // Mobile Safari iOS
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  // Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  // Older browsers
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
];

const PAGES = [
  '/', '/challenges', '/dashboard', '/earn', '/faq', '/leaderboard',
  '/news', '/privacy', '/redeem', '/referral', '/rewards', '/terms',
  '/wallpapers', '/wallet/create', '/wallet/login', '/wallet/recover', '/wallet/unlock',
  '/ads', '/animation-demo',
];

const VIEWPORTS = [
  { w: 1920, h: 1080 }, { w: 1366, h: 768 }, { w: 1536, h: 864 },
  { w: 1440, h: 900 }, { w: 1280, h: 800 }, { w: 1024, h: 768 },
  { w: 390, h: 844 },  { w: 375, h: 812 },  { w: 414, h: 896 },
];

function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

async function simulateUser(browser, cycleNum) {
  const context = await browser.newContext({
    userAgent: pick(USER_AGENTS),
    viewport: { width: pick(VIEWPORTS).w, height: pick(VIEWPORTS).h },
    locale: Math.random() > 0.5 ? 'en-US' : 'en-GB',
    timezoneId: Math.random() > 0.5 ? 'America/New_York' : 'Europe/London',
  });
  const page = await context.newPage();
  const errors = [];
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // Shuffle pages and visit a subset
  const pagesToVisit = [...PAGES].sort(() => Math.random() - 0.5).slice(0, 4 + (Math.random() * 6 | 0));
  const visited = [];

  for (const route of pagesToVisit) {
    const url = BASE + route;
    const start = Date.now();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const loadTime = Date.now() - start;

      // Scroll the page
      await page.evaluate(async () => {
        const delay = ms => new Promise(r => setTimeout(r, ms));
        const step = 300;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await delay(50 + Math.random() * 100);
        }
        window.scrollTo(0, document.body.scrollHeight);
        await delay(200);
        window.scrollTo(0, 0);
      });

      // Click interactive elements
      const interactiveCount = await page.evaluate(() => {
        let count = 0;
        document.querySelectorAll('a, button, [role="button"], .accordion-trigger, details summary, [onclick]').forEach(el => {
          if (el.offsetParent !== null && count < 5) {
            try { el.click(); count++; } catch (_) {}
          }
        });
        return count;
      });

      visited.push({ route, loadTime, interactiveClicks: interactiveCount, errors: [...consoleErrors] });
      consoleErrors.length = 0;
    } catch (e) {
      errors.push(`[${route}] ${e.message}`);
    }
  }

  await context.close();
  return { cycleNum, visited, errors };
}

async function main() {
  console.log(`Starting load test: ${CYCLES} cycles × ${PARALLEL} parallel = ${CYCLES * PARALLEL} visits`);
  console.log(`Target: ${BASE}`);
  console.log(`Pages: ${PAGES.length}`);
  console.log(`User agents: ${USER_AGENTS.length}`);
  console.log('---');

  const browser = await chromium.launch({ headless: true });
  let cycle = 0;
  let completed = 0;

  while (cycle < CYCLES) {
    const batch = [];
    const batchSize = Math.min(PARALLEL, CYCLES - cycle);
    for (let i = 0; i < batchSize; i++) {
      batch.push(simulateUser(browser, cycle + i));
    }
    cycle += batchSize;

    const results = await Promise.all(batch);
    for (const r of results) {
      completed++;
      const pageErrors = r.visited.filter(v => v.errors.length > 0);
      const navErrors = r.errors.length;
      const status = navErrors + pageErrors.length === 0 ? '✅' : '⚠️';
      if (navErrors + pageErrors.length > 0) {
        RESULTS.errors.push(...r.errors, ...pageErrors.flatMap(v => v.errors.map(e => `[${v.route}] ${e}`)));
      }
      RESULTS.ok++;
      for (const v of r.visited) {
        RESULTS.pages[v.route] = (RESULTS.pages[v.route] || 0) + 1;
      }
      if (completed % 50 === 0) {
        const elapsed = ((Date.now() - START) / 1000 / 60).toFixed(1);
        process.stdout.write(`\r${completed}/${CYCLES * PARALLEL} visits (${elapsed} min)`);
      }
    }
  }

  RESULTS.totalTime = ((Date.now() - START) / 1000).toFixed(1);
  await browser.close();

  // Write results
  fs.writeFileSync(OUTPUT, JSON.stringify(RESULTS, null, 2));
  console.log(`\n\nResults saved to ${OUTPUT}`);
  console.log(`Total visits: ${RESULTS.ok}`);
  console.log(`Total time: ${RESULTS.totalTime}s`);
  console.log(`Errors: ${RESULTS.errors.length}`);
  console.log(`\nPage distribution:`);
  for (const [route, count] of Object.entries(RESULTS.pages).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${route.padEnd(20)} ${count}`);
  }
  if (RESULTS.errors.length > 0) {
    console.log(`\nFirst 20 errors:`);
    RESULTS.errors.slice(0, 20).forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
}

main().catch(console.error);
