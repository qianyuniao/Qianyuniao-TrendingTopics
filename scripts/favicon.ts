import fs from "node:fs"
import { Buffer } from "node:buffer"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { consola } from "consola"
import { originSources } from "../shared/pre-sources"
import { HOTBOARD_HOMES } from "./hotboard-homes"

const projectDir = fileURLToPath(new URL("..", import.meta.url))
const iconsDir = join(projectDir, "public", "icons")

/** 图标统一尺寸（正方形，透明背景） */
const ICON_SIZE = 64
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47])
const ICO_MAGIC = Buffer.from([0x00, 0x00, 0x01, 0x00])

/**
 * 平台 id 与本地图标文件名的差异映射，与前端 PlatformIcon 保持一致
 * （另：专栏卡片用 `id.split("-")[0]` 取图标，如 bilibili-hot -> bilibili.png）
 */
const ICON_ALIAS: Record<string, string> = { kr36: "36kr", cto51: "51cto" }
function iconFileOf(id: string) {
  return (ICON_ALIAS[id] ?? id).split("-")[0]
}

/** sharp 是间接依赖（unimport/unocss 链上），按 pnpm 虚拟目录直接解析 */
function loadSharp() {
  try {
    const require = createRequire(import.meta.url)
    const glob = fs.readdirSync(join(projectDir, "node_modules/.pnpm"))
    const dir = glob.find(name => name.startsWith("sharp@") && !name.includes("+"))
    if (!dir) return null
    return require(join(projectDir, "node_modules/.pnpm", dir, "node_modules/sharp"))
  } catch {
    return null
  }
}

const sharp = loadSharp()

/** 抓取字节并做基本校验：拒绝 HTML 错误页与过小的响应 */
async function getIconBuffer(url: string, referer?: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, ...(referer ? { Referer: referer } : {}) },
      redirect: "follow",
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 200) return null
    const head = buf.subarray(0, 15).toString("latin1").toLowerCase()
    if (head.startsWith("<!doctype") || head.startsWith("<html")) return null
    return buf
  } catch {
    return null
  }
}

/** 转成统一尺寸的 PNG；sharp 缺失或格式不支持时返回 null */
async function toPng(buf: Buffer): Promise<Buffer | null> {
  if (!sharp) return null
  try {
    return await sharp(buf)
      .resize(ICON_SIZE, ICON_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  } catch {
    return null
  }
}

/**
 * 兜底图标服务抓不到 favicon 时会返回「默认圆形图标」（灰色圆 / 纯色圆环），
 * 特征是主导色为中性灰且信息熵很低；真实 logo 多为近黑/近白或彩色，不会命中。
 */
async function isPlaceholder(png: Buffer): Promise<boolean> {
  if (!sharp) return false
  try {
    const stats = await sharp(png).stats()
    if (stats.entropy < 1.2) return true
    const d = stats.dominant
    const gray = Math.max(Math.abs(d.r - d.g), Math.abs(d.g - d.b), Math.abs(d.r - d.b)) < 12
    if (gray && d.r >= 90 && d.r <= 200 && stats.entropy < 2.0) return true
    return false
  } catch {
    return false
  }
}

/** 从首页 HTML 里解析图标地址（link rel=icon / apple-touch-icon） */
function iconLinksOf(html: string): string[] {
  const hrefs: string[] = []
  for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi)) {
    const h = (m[0].match(/href=["']([^"']+)["']/i) ?? [])[1]
    if (h) hrefs.push(h)
  }
  return hrefs
}

/**
 * 抓取一个源的图标，按优先级尝试：
 *   1. 官网首页 <link rel="icon">
 *   2. 官网 /favicon.ico、/favicon.png
 *   3. 第三方图标服务（favicon.im，国内可达）
 * 兜底服务返回默认圆形图标时会被熵校验拒绝，避免写进占位图。
 */
async function downloadIcon(url: string, outputPath: string, id: string): Promise<boolean> {
  const candidates: Array<[string, string | undefined]> = []

  // 1) + 2) 官网首页解析与常见路径
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" })
    if (res.ok) {
      const html = await res.text()
      for (const h of iconLinksOf(html)) {
        candidates.push([h.startsWith("http") ? h : new URL(h, res.url).href, res.url])
      }
      for (const p of ["/favicon.ico", "/favicon.png"]) {
        candidates.push([new URL(p, res.url).href, res.url])
      }
    }
  } catch {
    // 官网不可达时直接走兜底服务
  }

  // 3) 第三方服务
  const domain = new URL(url).hostname
  candidates.push([`https://favicon.im/${domain}`, url])

  for (const [iconUrl, referer] of candidates) {
    const buf = await getIconBuffer(iconUrl, referer)
    if (!buf) continue

    const png = await toPng(buf)
    if (png) {
      if (await isPlaceholder(png)) continue
      fs.writeFileSync(outputPath, png)
      consola.success(`${id}: downloaded successfully.`)
      return true
    }
    // sharp 转不了（如特殊 ICO）：PNG / ICO 原样保留，浏览器 <img> 可解码
    if (buf.subarray(0, 4).equals(PNG_MAGIC) || buf.subarray(0, 4).equals(ICO_MAGIC)) {
      fs.writeFileSync(outputPath, buf)
      consola.success(`${id}: downloaded successfully (raw).`)
      return true
    }
  }

  consola.error(`${id}: error downloading the image.`)
  return false
}

async function main() {
  await Promise.all(
    Object.entries(originSources).map(async ([id, source]) => {
      const icon = join(iconsDir, `${iconFileOf(id)}.png`)
      if (fs.existsSync(icon)) return
      if (!source.home) return
      await downloadIcon(source.home, icon, id)
    }),
  )

  // 热榜平台多数没有对应的 sources 定义（acfun / haokan / channels / 虎牙 / 斗鱼等），
  // 图标同样放在 public/icons/<平台 id>.png，这里补齐
  await Promise.all(
    Object.entries(HOTBOARD_HOMES).map(async ([id, home]) => {
      const icon = join(iconsDir, `${iconFileOf(id)}.png`)
      if (fs.existsSync(icon)) return
      await downloadIcon(home, icon, id)
    }),
  )
}

main()
