// bench.js — 参数化基准：ANGLE 后端 / DSF / HEADLESS
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const path = require("path");
const DIR = __dirname;
const ANGLE = process.env.ANGLE || "gl";          // gl | vulkan | d3d11 | swiftshader
const DSF = parseInt(process.env.DSF || "2", 10);  // 2 => 4K, 1 => 1080p
const HEADLESS = process.env.HL || "new";          // new | true
const N = parseInt(process.env.N || "10", 10);
const CAND = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const CHROME = CAND.find((p) => fs.existsSync(p));
const W = 1920, H = 1080;
const out = [];
const log = (m) => { out.push(m); fs.writeFileSync(path.join(DIR, "bench.log"), out.join("\n") + "\n"); };
log(`CONFIG ANGLE=${ANGLE} DSF=${DSF} HL=${HEADLESS} N=${N}`);
(async () => {
  const args = ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--hide-scrollbars","--force-color-profile=srgb","--window-size=1920,1080"];
  if (ANGLE === "swiftshader") { args.push("--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"); }
  else if (ANGLE === "vulkan") { args.push("--use-gl=angle","--use-angle=vulkan","--enable-features=Vulkan","--enable-gpu","--ignore-gpu-blocklist"); }
  else if (ANGLE === "d3d11") { args.push("--use-gl=angle","--use-angle=d3d11","--enable-gpu","--ignore-gpu-blocklist"); }
  else { args.push("--use-gl=angle","--use-angle=gl","--enable-gpu","--ignore-gpu-blocklist"); }
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: HEADLESS === "new" ? "new" : true, args });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: DSF });
  page.on("pageerror", (e) => log("[pageerror] " + e.message));
  await page.goto("file://" + path.join(DIR, "index.html"), { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.__ready === true, { timeout: 60000 });
  const gpu = await page.evaluate(() => { const c = document.createElement("canvas"); const gl = c.getContext("webgl"); if (!gl) return "NO_WEBGL"; const d = gl.getExtension("WEBGL_debug_renderer_info"); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "ok"; });
  log("WEBGL=" + gpu);
  await page.addStyleTag({ content: `html,body{margin:0!important;padding:0!important;overflow:hidden!important;} #viewport,#stage{position:absolute!important;top:0!important;left:0!important;width:1920px!important;height:1080px!important;transform:none!important;} #controls,#hint{display:none!important;}` });
  await page.evaluate(() => window.player.seek(0));
  await new Promise((r) => setTimeout(r, 600));
  let sum = 0;
  for (let i = 0; i < N; i++) {
    await page.evaluate((tt) => window.player.seek(tt), i * 6);
    await new Promise((r) => setTimeout(r, 120));
    const t0 = Date.now();
    await page.screenshot({ path: path.join(DIR, "bench_" + i + ".jpg"), type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: W, height: H }, captureBeyondViewport: false });
    const dt = Date.now() - t0; sum += dt;
    log(`frame ${i}: ${dt}ms`);
  }
  log(`AVG=${(sum / N).toFixed(0)}ms  est_total_4560=${(sum / N * 4560 / 1000).toFixed(0)}s`);
  await browser.close();
  log("done");
})().catch((e) => { log("FATAL: " + (e && e.stack ? e.stack : e)); process.exit(1); });
