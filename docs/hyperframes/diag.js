// diag.js — 最小诊断：确认 Chrome 能启动、页面能就绪、能截一帧
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const path = require("path");
const DIR = __dirname;
const log = (m) => { fs.appendFileSync(path.join(DIR, "diag.log"), m + "\n"); };
const CAND = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const CHROME = CAND.find((p) => fs.existsSync(p));
log("CHROME=" + CHROME);
(async () => {
  log("launching...");
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--hide-scrollbars","--force-color-profile=srgb","--window-size=1920,1080"],
  });
  log("launched, version=" + (await browser.version()));
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => log("[pageerror] " + e.message));
  page.on("console", (m) => { const t = m.text(); if (t.toLowerCase().includes("error") || t.includes("THREE")) log("[page] " + t); });
  log("goto...");
  await page.goto("file://" + path.join(DIR, "index.html"), { waitUntil: "load", timeout: 60000 });
  log("loaded");
  try {
    await page.waitForFunction(() => window.__ready === true, { timeout: 30000 });
    log("READY OK");
  } catch (e) {
    log("READY TIMEOUT: " + e.message);
    const hasPlayer = await page.evaluate(() => typeof window.player);
    const hasReady = await page.evaluate(() => window.__ready);
    log("typeof player=" + hasPlayer + " __ready=" + hasReady);
  }
  await page.addStyleTag({ content: `html,body{margin:0!important;padding:0!important;overflow:hidden!important;} #viewport,#stage{position:absolute!important;top:0!important;left:0!important;width:1920px!important;height:1080px!important;transform:none!important;} #controls,#hint{display:none!important;}` });
  await page.evaluate(() => window.player && window.player.seek(10));
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DIR, "diag_frame.jpg"), type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: 1920, height: 1080 }, captureBeyondViewport: false });
  log("screenshot saved");
  await browser.close();
  log("done");
})().catch((e) => { log("FATAL: " + e.message); process.exit(1); });
