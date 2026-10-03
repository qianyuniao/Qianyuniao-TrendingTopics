import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { UA_ANDROID_CHROME, httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "纽约时报"
export const DESC = "纽约时报"
export const options = [
  { name: "area", default: "china", choices: ["china", "global"], help: "地区类型" },
]
export const TYPES: Record<string, string> = { china: "中文网", global: "全球版" }

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const area = params?.area ?? "china"
  const url = area === "china"
    ? "https://cn.nytimes.com/rss/"
    : "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
  const headers = {
    "User-Agent": UA_ANDROID_CHROME,
  }
  const content = await httpGetText(url, headers)
  const $ = cheerio.load(content, { xml: true })
  const items: HotboardItem[] = []
  $("item").each((_, el) => {
    const item = $(el)
    const link = item.find("link").text().trim()
    items.push({
      id: item.find("guid").text().trim() || item.find("id").text().trim() || link,
      title: item.find("title").text().trim(),
      desc: item.find("description").text().trim() || null,
      author: item.find("author").text().trim() || null,
      time: getTime(item.find("pubDate").text().trim()),
      url: link,
      mobile_url: link,
    } as HotboardItem)
  })
  return items
}
