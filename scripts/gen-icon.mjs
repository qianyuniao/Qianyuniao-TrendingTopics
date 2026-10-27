/**
 * 生成 Tauri 所需的桌面应用图标（占位）。
 * 纯 Node 实现，不依赖任何第三方库：
 *  - icons/icon.png  512x512 透明背景上的品牌渐变圆 + 白色内核
 *  - icons/icon.ico  直接内嵌上述 PNG 的 ICO（Windows 原生支持 PNG-in-ICO）
 *
 * 正式发布前请用项目真实 Logo 替换：
 *   npx @tauri-apps/cli icon path/to/logo.png
 */
import zlib from "node:zlib"
import { writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "src-tauri", "icons")
mkdirSync(outDir, { recursive: true })

const SIZE = 512

/** 标准 CRC32（PNG chunk 校验用） */
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, "ascii")
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

/** 构建 RGBA 像素：径向渐变背景 + 居中的白色圆点（极简风占位图标） */
const rgba = Buffer.alloc(SIZE * SIZE * 4)
const cx = SIZE / 2
const cy = SIZE / 2
const maxR = SIZE / 2
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const t = Math.min(1, dist / maxR)
    // 品牌渐变：从 #0A84FF（蓝）过渡到 #5E5CE6（紫）
    const r = Math.round(0x0a + (0x5e - 0x0a) * t)
    const g = Math.round(0x84 + (0x5c - 0x84) * t)
    const b = Math.round(0xff + (0xe6 - 0xff) * t)
    // 中心白色内核（半径约 26%）
    const inner = dist < maxR * 0.26
    if (inner) {
      rgba[i] = 255
      rgba[i + 1] = 255
      rgba[i + 2] = 255
      rgba[i + 3] = 255
    } else {
      rgba[i] = r
      rgba[i + 1] = g
      rgba[i + 2] = b
      rgba[i + 3] = 255
    }
  }
}

// 编码 PNG（每个扫描行前置 filter 字节 0）
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0
  rgba.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type RGBA
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
])

const pngPath = join(outDir, "icon.png")
writeFileSync(pngPath, png)

// ICO：头部(6) + 目录项(16) + PNG 数据
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type = icon
header.writeUInt16LE(1, 4) // count
const entry = Buffer.alloc(16)
entry[0] = SIZE // width (0 表示 256)
entry[1] = SIZE // height
entry[2] = 0 // palette
entry[3] = 0 // reserved
entry.writeUInt16LE(1, 4) // planes
entry.writeUInt16LE(32, 6) // bit count
entry.writeUInt32LE(png.length, 8) // pixel data size
entry.writeUInt32LE(6 + 16, 12) // offset
const ico = Buffer.concat([header, entry, png])
const icoPath = join(outDir, "icon.ico")
writeFileSync(icoPath, ico)

console.log(`[gen-icon] 已生成: ${pngPath} (${png.length} B), ${icoPath} (${ico.length} B)`)
