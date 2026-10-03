/**
 * 前后端共用的纯函数工具（由 unimport 自动导入）
 */

/** 把时间戳转成相对时间文案：刚刚 / N 分钟前 / N 小时前 / M 月 D 日 */
export function relativeTime(timestamp: string | number) {
  if (!timestamp) return undefined
  const date = new Date(timestamp)
  if (Number.isNaN(date.getDay())) return undefined

  const now = new Date()
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000
  const diffInMinutes = diffInSeconds / 60
  const diffInHours = diffInMinutes / 60

  if (diffInSeconds < 60) {
    return "刚刚"
  } else if (diffInMinutes < 60) {
    const minutes = Math.floor(diffInMinutes)
    return `${minutes}分钟前`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours}小时前`
  } else {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

/** 延时指定毫秒 */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 生成 UUID v4 字符串（纯 JS 实现，不依赖 crypto，非安全上下文也可用） */
export function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
