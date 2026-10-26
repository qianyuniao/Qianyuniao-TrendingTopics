import process from "node:process"
import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "小红书"
export const DESC = "小红书热搜榜"

/**
 * 小红书热搜榜，两条取数路径：
 *
 * 1. 官方接口 `edith.xiaohongshu.com`（需登录态）：配置 .env.server 的
 *    XIAOHONGSHU_COOKIE 后生效。该接口带风控，若返回 406 说明还缺请求签名，
 *    需再从浏览器 Network 面板复制 x-s / x-t 填入 XIAOHONGSHU_XS / XIAOHONGSHU_XT。
 *    签名会随时间失效，属可选增强路径。
 *
 * 2. 公共聚合接口 uapis.cn（免配置，默认路径）：小红书未开放免登录热榜接口，
 *    官方路径又依赖会过期的 Cookie 与签名，故默认走第三方聚合站拿到榜单。
 *    注意：这是外部公共服务，若其不可用则本平台返回空（不影响其他平台）。
 */
export async function fetch(): Promise<HotboardItem[]> {
  // 路径 1：官方接口（仅在配置了 Cookie 时尝试）
  if (process.env.XIAOHONGSHU_COOKIE) {
    try {
      const items = await fetchOfficial()
      if (items.length) return items
    } catch {
      // 签名过期 / 接口风控：静默降级到公共接口，不让整个看板报错
    }
  }

  // 路径 2：公共聚合接口（默认）
  return await fetchViaAggregator()
}

/** 官方接口：需要登录态 Cookie，风控时还需 x-s / x-t 签名头 */
async function fetchOfficial(): Promise<HotboardItem[]> {
  const headers: Record<string, string> = {
    "User-Agent": UA_WIN_CHROME,
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.xiaohongshu.com/explore",
    "Origin": "https://www.xiaohongshu.com",
  }
  headers.Cookie = process.env.XIAOHONGSHU_COOKIE as string
  if (process.env.XIAOHONGSHU_XS) headers["x-s"] = process.env.XIAOHONGSHU_XS
  if (process.env.XIAOHONGSHU_XT) headers["x-t"] = process.env.XIAOHONGSHU_XT

  const url = "https://edith.xiaohongshu.com/api/sns/web/v1/search/hotlist?image_formats=jpg,webp,avif"
  const res: any = await httpGet(url, headers)
  const list: any[] = res?.data?.word_list ?? []
  return list.map((it: any, idx: number): HotboardItem => {
    const word = it.word ?? it.display_word ?? null
    return {
      id: it.id ?? word ?? idx,
      title: word,
      desc: null,
      author: null,
      time: null,
      hot: it.hot ?? it.heat ?? null,
      cover: null,
      url: it.link
        ?? (word ? `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(word)}` : null),
      mobile_url: null,
    }
  })
}

/** 公共聚合接口：无需任何配置，带热度值与封面图 */
async function fetchViaAggregator(): Promise<HotboardItem[]> {
  const url = "https://uapis.cn/api/v1/misc/hotboard?type=xiaohongshu"
  const res: any = await httpGet(url, { "User-Agent": UA_WIN_CHROME })
  const list: any[] = res?.list ?? []
  return list.map((it: any, idx: number): HotboardItem => ({
    id: it.index ?? it.title ?? idx,
    title: it.title ?? null,
    desc: null,
    author: null,
    time: null,
    hot: it.hot_value ?? null,
    cover: it.cover ?? it?.extra?.cover ?? null,
    url: it.url ?? null,
    mobile_url: null,
  }))
}
