/**
 * 时间解析：替代 Python hotboard.utils.get_time
 * 支持：纯数字时间戳（秒/毫秒/微秒自动识别）、相对时间（刚刚/3分钟前）、
 * ISO 8601、YYYY-MM-DD / MM-DD、RFC 2822
 * 无法识别时返回 null（而非抛异常）
 */

const MIN_TIMESTAMP = 946684800 // 2000-01-01
const MAX_TIMESTAMP = 4102444800 // 2100-01-01

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatTimestamp(value: number): string | null {
  for (const scale of [1, 1000, 1000000]) {
    const seconds = value / scale
    if (seconds >= MIN_TIMESTAMP && seconds <= MAX_TIMESTAMP) {
      const d = new Date(seconds * 1000)
      if (Number.isNaN(d.getTime())) return null
      return formatDate(d)
    }
  }
  return null
}

const RELATIVE_RE = /^(?:(\d+(?:\.\d+)?)\s*)?(秒|分钟|[分天周月年]|小时|个月)前$/
const RELATIVE_UNITS: Record<string, number> = {
  秒: 1,
  分钟: 60,
  分: 60,
  小时: 3600,
  天: 86400,
  周: 604800,
  个月: 2592000,
  月: 2592000,
  年: 31536000,
}

function parseRelativeTime(text: string): string | null {
  if (text === "刚刚" || text === "刚才" || text.toLowerCase() === "just now") {
    return formatDate(new Date())
  }
  const m = RELATIVE_RE.exec(text)
  if (!m) return null
  const unit = RELATIVE_UNITS[m[2]]
  if (!unit) return null
  const num = Number.parseFloat(m[1] || "1")
  return formatDate(new Date(Date.now() - unit * num * 1000))
}

export function getTime(input: string | number | null | undefined): string | null {
  if (!input) return null

  if (typeof input === "number") {
    return formatTimestamp(input)
  }

  const text = input.trim()
  if (!text) return null

  // 纯数字时间戳
  if (/^\d+$/.test(text)) {
    return formatTimestamp(Number(text))
  }

  // 相对时间
  const relative = parseRelativeTime(text)
  if (relative) return relative

  try {
    // ISO 8601（如 2026-02-28T08:10:09）
    if (text.includes("T") && text.includes("-") && text.indexOf("T") > text.indexOf("-")) {
      const dt = new Date(text.replace("Z", "+00:00"))
      if (!Number.isNaN(dt.getTime())) return formatDate(dt)
    }

    // 常见日期格式
    if (text.includes("-")) {
      const parts = text.split("-")
      if (parts.length === 4) {
        // 2026-03-15-12
        return `${parts[0]}-${parts[1]}-${parts[2]} ${parts[3]}:00`
      }
      if (parts.length === 3 && parts[0].length === 4) {
        // 2026-03-15
        return text
      }
      if (parts.length === 2) {
        // 03-13（补充当前年份）
        return `${new Date().getFullYear()}-${parts[0]}-${parts[1]}`
      }
    }

    // RFC 2822 等
    const dt = new Date(text)
    if (!Number.isNaN(dt.getTime())) return formatDate(dt)
  } catch {
    return null
  }

  return null
}
