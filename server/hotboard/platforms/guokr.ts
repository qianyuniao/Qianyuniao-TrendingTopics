import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "果壳"
export const DESC = "果壳热门文章"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.guokr.com/beta/proxy/science_api/articles?limit=30"
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  }
  const result: any[] = await httpGet(url, headers)
  return (result ?? []).map((item: any) => {
    const authorData = item.author
    const author = authorData?.nickname ?? null
    const id = item.id
    return {
      id,
      title: item.title,
      desc: item.summary,
      time: getTime(item.date_modified),
      url: `https://www.guokr.com/article/${id}`,
      mobile_url: `https://m.guokr.com/article/${id}`,
      cover: item.small_image,
      author,
    } as HotboardItem
  })
}
