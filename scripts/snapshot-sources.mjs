/**
 * 信息源静态快照：把所有信息源当前数据抓下来，写成 public/api/s/<id>.json，
 * 供 Pages（纯静态托管、无服务端）直接读取（GET /api/s?id=xxx 的静态版）。
 *
 * 依赖本地 dev 服务器（vite dev）编译并执行 getters：
 *   node scripts/snapshot-sources.mjs <devPort>
 *
 * 用法：先 `npx vite dev --port 5199`，再 `node scripts/snapshot-sources.mjs 5199`
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"

const port = process.argv[2] ?? "5199"
const base = `http://localhost:${port}/api/s`
const CONCURRENCY = 8
const TIMEOUT_MS = 60_000

const sources = JSON.parse(await import("node:fs").then(m => m.readFileSync(join(process.cwd(), "shared", "sources.json"), "utf-8")))

// 有 redirect 的源取最终目标，避免重复抓取
const finalIds = []
for (const [id, s] of Object.entries(sources)) {
  if (s.redirect) continue
  finalIds.push(id)
}

const outDir = join(process.cwd(), "public", "api", "s")
mkdirSync(outDir, { recursive: true })

let ok = 0
const failed = []
const queue = [...finalIds]

async function fetchOne(id) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${base}?id=${encodeURIComponent(id)}`, { signal: ctrl.signal })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`non-JSON (${res.status}): ${text.slice(0, 80)}`)
    }
    if (!Array.isArray(data.items)) throw new Error(`no items (${data.status ?? "?"})`)
    // 以响应里的最终 id 落盘（服务端可能内部重定向）
    const finalId = data.id || id
    writeFileSync(join(outDir, `${finalId}.json`), JSON.stringify(data))
    return { id, finalId, n: data.items.length }
  } finally {
    clearTimeout(t)
  }
}

async function worker() {
  while (queue.length) {
    const id = queue.shift()
    try {
      const r = await fetchOne(id)
      ok++
      console.log(`[snap-src] ok   ${r.finalId} (${r.n} items)`)
    } catch (e) {
      failed.push(id)
      console.warn(`[snap-src] FAIL ${id}: ${e?.message ?? e}`)
    }
  }
}

console.log(`[snap-src] total final ids: ${finalIds.length}`)
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log(`[snap-src] done: ok=${ok} fail=${failed.length}${failed.length ? ` -> ${failed.join(",")}` : ""}`)
