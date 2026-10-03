import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { UA_WIN_CHROME, httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "Linux.do"
export const DESC = "Linux.do 热门文章"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://linux.do/top.rss?period=weekly"
  const headers = {
    "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    "User-Agent": UA_WIN_CHROME,
  }
  const content = await httpGetText(url, headers)
  const $ = cheerio.load(content, { xml: true })
  const items: HotboardItem[] = []
  $("item").each((_, el) => {
    const item = $(el)
    const link = item.find("link").text().trim()
    let desc = item.find("description").text().trim()
    if (desc) {
      const stripped = cheerio.load(desc).root().text().trim()
      desc = stripped || desc
    }
    items.push({
      id: item.find("guid").text().trim() || item.find("id").text().trim() || link,
      title: item.find("title").text().trim(),
      desc: desc || null,
      author: item.find("author").text().trim() || null,
      time: getTime(item.find("pubDate").text().trim()),
      url: link,
      mobile_url: link,
    } as HotboardItem)
  })
  return items
}
