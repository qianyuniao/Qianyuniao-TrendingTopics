import process from "node:process"
import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "小红书"
export const DESC = "小红书热搜榜（需配置 Cookie）"

// 小红书热搜榜：接口需要登录态 Cookie。
// 在 .env.server 配置 XIAOHONGSHU_COOKIE 后启用；
// 若接口返回 406，则还需补充请求签名头 XIAOHONGSHU_XS / XIAOHONGSHU_XT
// （从浏览器开发者工具 Network 中复制对应请求的 x-s / x-t 值）。
export async function fetch(): Promise<HotboardItem[]> {
  const cookie = process.env.XIAOHONGSHU_COOKIE
  if (!cookie) return []

  const headers: Record<string, string> = {
    "Cookie": cookie,
    "User-Agent": UA_WIN_CHROME,
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.xiaohongshu.com/explore",
    "Origin": "https://www.xiaohongshu.com",
  }
  if (process.env.XIAOHONGSHU_XS) headers["x-s"] = process.env.XIAOHONGSHU_XS
  if (process.env.XIAOHONGSHU_XT) headers["x-t"] = process.env.XIAOHONGSHU_XT

  const url = "https://edith.xiaohongshu.com/api/sns/web/v1/search/hotlist?image_formats=jpg,webp,avif"
  const res: any = await httpGet(url, headers)
  const list: any[] = res?.data?.word_list ?? []
  return list.map((it: any, idx: number) => {
    const word = it.word ?? it.display_word ?? null
    const id = it.id ?? word ?? idx
    const urlStr = it.link
      ?? (word ? `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(word)}` : null)
    return {
      id,
      title: word,
      hot: it.hot ?? it.heat ?? null,
      url: urlStr,
    } as HotboardItem
  })
}
