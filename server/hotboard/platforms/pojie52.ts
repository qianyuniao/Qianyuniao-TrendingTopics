import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { UA_ANDROID_CHROME, httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "吾爱破解"
export const DESC = "吾爱破解论坛"
export const options = [
  { name: "type", default: "digest", choices: ["digest", "hot", "new", "newthread"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = {
  digest: "最新精华",
  hot: "最新热门",
  new: "最新回复",
  newthread: "最新发表",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "digest"
  const url = `https://www.52pojie.cn/forum.php?mod=guide&view=${type}&rss=1`
  const headers = {
    "User-Agent": UA_ANDROID_CHROME,
  }
  const content = await httpGetText(url, headers, "gbk")
  const $ = cheerio.load(content, { xml: true })
  const items: HotboardItem[] = []
  $("item").each((_, el) => {
    const item = $(el)
    const link = item.find("link").text().trim()
    items.push({
      id: link,
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
