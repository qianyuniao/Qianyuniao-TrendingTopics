import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"

export const PLATFORM_NAME = "微博"
export const DESC = "微博热搜榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://weibo.com/ajax/side/hotSearch"
  const headers = {
    "Referer": "https://weibo.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  }
  const result: any = await httpGet(url, headers)
  const realtime: any[] = result?.data?.realtime ?? []
  return realtime.map((item: any) => {
    const title = item.word ?? ""
    const url2 = `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`
    return {
      title,
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
