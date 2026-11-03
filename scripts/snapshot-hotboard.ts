/**
 * 热榜静态快照：把所有平台当前热榜抓下来，写成 public/api 下的静态 JSON，
 * 供 Pages（纯静态托管、无服务端）直接读取。
 *
 * 产物：
 *   public/api/hotboard.json            平台列表（GET /api/hotboard 的静态版）
 *   public/api/hotboard/<id>.json       单平台榜单（GET /api/hotboard/:id 的静态版）
 *
 * 用法：npm run snapshot   （需能直连各数据源的本机网络环境）
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"
import { fetchPlatform, listPlatforms } from "../server/hotboard/registry"

const CONCURRENCY = 8

async function main() {
  const platforms = listPlatforms()
  const outDir = join(process.cwd(), "public", "api")
  const detailDir = join(outDir, "hotboard")
  mkdirSync(detailDir, { recursive: true })

  writeFileSync(join(outDir, "hotboard.json"), JSON.stringify(platforms))
  console.log(`[snapshot] platform list written: ${platforms.length}`)

  let ok = 0
  const failed: string[] = []
  const queue = [...platforms]

  async function worker() {
    while (queue.length) {
      const p = queue.shift()!
      try {
        const data = await fetchPlatform(p.id)
        writeFileSync(join(detailDir, `${p.id}.json`), JSON.stringify(data))
        ok++
        console.log(`[snapshot] ok   ${p.id} (${data.total} items)`)
      } catch (e: any) {
        failed.push(p.id)
        console.warn(`[snapshot] FAIL ${p.id}: ${e?.message ?? e}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  console.log(`[snapshot] done: ok=${ok} fail=${failed.length}${failed.length ? ` -> ${failed.join(",")}` : ""}`)
}

main()
