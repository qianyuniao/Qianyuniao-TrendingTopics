// render.js — 4K 帧捕获（HyperFrames 动画 -> 图片序列）
// 用法: node render.js            (断点续渲：跳过已存在帧)
//       node render.js --fps 30 --start 0
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const DIR = __dirname;
const LOG = path.join(DIR, "render.log");
const HTML = "file://" + path.join(DIR, "index.html");
const FRAMES = path.join(DIR, "frames");
const FPS = parseInt(process.env.FPS || "30", 10);
const TOTAL = 152; // 与 index.html TOTAL 一致
const TOTAL_FRAMES = Math.round(TOTAL * FPS);
const MAX_FRAMES = process.env.MAX ? Math.min(TOTAL_FRAMES, parseInt(process.env.MAX, 10)) : TOTAL_FRAMES;

function log(m) { const s = `[${new Date().toISOString()}] ${m}`; fs.appendFileSync(LOG, s + "\n"); }
// 健壮性：任何未捕获异常都写日志，避免静默退出
process.on("uncaughtException", (e) => { log("UNCAUGHT: " + (e && e.stack ? e.stack : e)); });
process.on("unhandledRejection", (e) => { log("UNHANDLED_REJECTION: " + (e && e.stack ? e.stack : e)); });

// 候选浏览器
const CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const CHROME = CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) { log("未找到 Chrome/Edge，无法渲染"); process.exit(2); }
log("使用浏览器: " + CHROME);

if (!fs.existsSync(FRAMES)) fs.mkdirSync(FRAMES, { recursive: true });

// 续渲：找已存在最大帧号
function existingMax() {
  let max = -1;
  try {
    for (const f of fs.readdirSync(FRAMES)) {
      const m = /^frame_(\d{5})\.jpg$/.exec(f);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  } catch (e) {}
  return max;
}
let START = parseInt(process.env.START || "0", 10);
if (isNaN(START) || START < 0) START = 0;
const resumeFrom = existingMax() + 1;
const begin = Math.max(START, resumeFrom);
log(`总帧数 ${TOTAL_FRAMES}，从帧 ${begin} 开始（续渲检测最大已存在=${existingMax() < 0 ? "无" : existingMax()}）`);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--use-gl=angle",
      "--use-angle=gl",
      "--enable-gpu",
      "--ignore-gpu-blocklist",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--window-size=1920,1080",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  page.on("console", (m) => { const t = m.text(); if (t.includes("THREE") || t.toLowerCase().includes("error")) log("[page] " + t); });
  page.on("pageerror", (e) => log("[pageerror] " + e.message));

  log("加载页面: " + HTML);
  await page.goto(HTML, { waitUntil: "load", timeout: 60000 });

  await page.waitForFunction(
    () => window.__ready === true && window.player && typeof window.player.seek === "function",
    { timeout: 60000 }
  );
  log("页面就绪");

  // 渲染态：禁用自适应缩放，让舞台正好填满 1920x1080；隐藏播放器控件/提示
  await page.addStyleTag({
    content: `
      html,body{margin:0!important;padding:0!important;overflow:hidden!important;background:#05080f!important;}
      #viewport,#stage{position:absolute!important;top:0!important;left:0!important;width:1920px!important;height:1080px!important;transform:none!important;}
      #controls,#hint{display:none!important;}
    `,
  });
  // 预热一帧，确保 WebGL 上下文已出图
  await page.evaluate((tt) => window.player.seek(tt), 0);
  await new Promise((r) => setTimeout(r, 400));

  log("开始逐帧捕获（4K / " + FPS + "fps）...");
  const t0 = Date.now();
  let done = 0;
  for (let i = begin; i < MAX_FRAMES; i++) {
    const t = i / FPS;
    const file = path.join(FRAMES, "frame_" + String(i).padStart(5, "0") + ".jpg");
    try {
      await page.evaluate((tt) => window.player.seek(tt), t);
      await new Promise((r) => setTimeout(r, 110));
      await page.screenshot({
        path: file,
        type: "jpeg",
        quality: 92,
        clip: { x: 0, y: 0, width: 1920, height: 1080 },
        captureBeyondViewport: false,
      });
    } catch (e) {
      log(`帧 ${i} 失败: ${e && e.message ? e.message : e}（跳过，继续）`);
      try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (_) {}
      continue;
    }
    done++;
    if (i % 50 === 0 || i === TOTAL_FRAMES - 1) {
      const el = ((Date.now() - t0) / 1000).toFixed(1);
      const rate = (i - begin + 1) / Math.max(1, (Date.now() - t0) / 1000);
      const eta = (TOTAL_FRAMES - i) / Math.max(0.001, rate);
      log(`帧 ${i}/${TOTAL_FRAMES}  用时 ${el}s  速率 ${rate.toFixed(2)}fps  剩余约 ${eta.toFixed(0)}s`);
    }
  }

  await browser.close();
  log(`捕获完成。本次成功 ${done} 帧，帧目录: ${FRAMES}`);
})().catch((e) => { log("渲染失败: " + (e && e.stack ? e.stack : e)); process.exit(1); });
