import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { UA_ANDROID_CHROME, httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "全球主机交流"
export const DESC = "全球主机交流论坛"
export const options = [
  { name: "type", default: "hot", choices: ["hot", "digest", "new", "newthread"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = {
  hot: "最新热门",
  digest: "最新精华",
  new: "最新回复",
  newthread: "最新发表",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "hot"
  const url = `https://hostloc.com/forum.php?mod=guide&view=${type}&rss=1`
  const headers = {
    "User-Agent": UA_ANDROID_CHROME,
  }
  const content = await httpGetText(url, headers)
  const $ = cheerio.load(content, { xml: true })
  const items: HotboardItem[] = []
  $("item").each((_, el) => {
    const item = $(el)
    const title = item.find("title").text().trim()
    const link = item.find("link").text().trim()
    const guid = item.find("guid").text().trim() || link
    const summary = item.find("description").text().trim()
    const pubDate = item.find("pubDate").text().trim()
    const author = item.find("author").text().trim()
    if (!title) return
    items.push({
      id: guid,
      title,
      desc: summary || null,
      author: author || null,
      time: getTime(pubDate),
      url: link,
      mobile_url: link,
    } as HotboardItem)
  })
  return items
}
