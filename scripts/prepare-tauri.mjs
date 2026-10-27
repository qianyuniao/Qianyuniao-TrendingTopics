/**
 * Tauri 构建前准备：
 * 1. 将当前 Node 运行时（node.exe，需为 v24，与 better-sqlite3 原生模块 ABI 一致）
 *    复制到 src-tauri/binaries/node.exe，供 Tauri 作为资源打包进桌面应用。
 * 2. 将 dist/output/server/node_modules 下的 junction/symlink 物化为真实目录
 *    （nitro 用 junction 链接外部依赖到 .nitro 存储，NSIS 打包不会跟随链接，
 *    导致安装后模块丢失，如 cheerio 依赖的 entities）。
 *
 * 由 tauri.conf.json 的 beforeBuildCommand 自动调用。
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync, readlinkSync, rmSync, renameSync } from "node:fs"
import { join, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dest = join(root, "src-tauri", "binaries", "node.exe")

mkdirSync(dirname(dest), { recursive: true })
if (!existsSync(dest)) {
  copyFileSync(process.execPath, dest)
  console.log(`[prepare-tauri] 已复制 node.exe -> ${dest}`)
} else {
  console.log(`[prepare-tauri] node.exe 已存在，跳过: ${dest}`)
}

// ---- 物化 server/node_modules 下的 junction/symlink ----
const serverNm = join(root, "dist", "output", "server", "node_modules")

function copyDeep(src, target) {
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name)
    const d = join(target, entry.name)
    if (entry.isDirectory()) copyDeep(s, d)
    else copyFileSync(s, d)
  }
}

if (existsSync(serverNm)) {
  let fixed = 0
  const stack = [serverNm]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isSymbolicLink()) {
        // junction/symlink：解析目标 -> 复制为真实目录 -> 替换链接
        try {
          const raw = readlinkSync(full)
          const target = resolve(dirname(full), raw)
          if (!existsSync(target)) continue
          const tmp = `${full}.__real__`
          rmSync(tmp, { recursive: true, force: true })
          copyDeep(target, tmp)
          rmSync(full, { recursive: true, force: true }) // 仅删除链接本身
          renameSync(tmp, full)
          fixed++
        } catch (e) {
          console.warn(`[prepare-tauri] 物化失败 ${full}: ${e.message}`)
        }
      } else if (entry.isDirectory()) {
        stack.push(full)
      }
    }
  }
  console.log(`[prepare-tauri] 已物化 ${fixed} 个 junction/symlink -> 真实目录`)
} else {
  console.warn(`[prepare-tauri] 未找到 ${serverNm}，跳过物化`)
}
