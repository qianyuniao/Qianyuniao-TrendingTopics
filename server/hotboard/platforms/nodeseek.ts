import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "NodeSeek"
export const DESC = "NodeSeek 最新帖子"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://rss.nodeseek.com/"
  const content = await httpGetText(url)
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
