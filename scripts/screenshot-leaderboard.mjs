import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: { width: 390, height: 1000 },
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
})
const page = await ctx.newPage()

await page.goto("https://gta6-rewards.vercel.app/leaderboard", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(5000)

await page.screenshot({ path: "mobile-leaderboard-all.png", fullPage: true })

await page.evaluate(() => { window.scrollTo(0, 0) })

await page.screenshot({ path: "mobile-leaderboard-top.png", fullPage: false })

await browser.close()
console.log("Done")
