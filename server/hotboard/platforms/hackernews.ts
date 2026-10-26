/**
 * 热榜平台源：Hacker News —— 前沿热门
 * news.ycombinator.com 直连超时，改走 HN 官方搜索服务 Algolia 的 front_page 接口
 */
import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "Hacker News"
export const DESC = "Hacker News 前沿热门"

export async function fetch(): Promise<HotboardItem[]> {
  const result: any = await httpGet("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30")
  return (result?.hits ?? []).map((hit: any) => {
    const id = hit.objectID
    const url = hit.url ?? `https://news.ycombinator.com/item?id=${id}`
    return {
      id,
      title: hit.title,
      author: hit.author,
      hot: hit.points,
      time: getTime(hit.created_at),
      url,
      mobile_url: url,
    } as HotboardItem
  })
}
