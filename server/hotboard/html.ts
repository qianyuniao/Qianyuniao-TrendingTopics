import type { Cheerio } from "cheerio"

/**
 * cheerio 解析工具：各平台抓取 HTML 页面时的重复写法统一收敛到这里
 * - `pickText` / `pickAttr`：取代到处手写的 `el.length ? el.text().trim() : null`
 * - `absUrl` / `toHttps`：取代 `href.startsWith("http") ? href : BASE + href` 与协议替换
 */

/** 取首个匹配元素的文本；元素不存在或文本为空时返回 null */
export function pickText(root: Cheerio<any>, selector: string): string | null {
  const el = root.find(selector).first()
  if (!el.length) return null
  return el.text().trim() || null
}

/** 取首个匹配元素的属性值；元素或属性缺失时返回 null */
export function pickAttr(root: Cheerio<any>, selector: string, attr: string): string | null {
  const el = root.find(selector).first()
  if (!el.length) return null
  return el.attr(attr) || null
}

/** 补全相对地址：已是绝对地址则原样返回，为空则返回 null */
export function absUrl(href: string | null | undefined, base: string): string | null {
  if (!href) return null
  return href.startsWith("http") ? href : `${base}${href}`
}

/** 把 http:// 升级为 https://（部分站点返回的封面 / 链接仍是 http） */
export function toHttps(url: string | null | undefined): string | null {
  if (!url) return null
  return url.replace(/^http:/, "https:")
}
