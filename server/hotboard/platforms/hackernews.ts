import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { UA_MAC_CHROME, httpGetText } from "../http"

export const PLATFORM_NAME = "Hacker News"
export const DESC = "Hacker News Popular"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://news.ycombinator.com"
  const headers = {
    "User-Agent": UA_MAC_CHROME,
    "Accept-Language": "en-US,en;q=0.9",
  }
  const html = await httpGetText(url, headers)
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $("tr.athing").each((_, el) => {
    const story = $(el)
    const storyId = story.attr("id")
    if (!storyId) return
    const titleEl = story.find(".titleline a").first()
    if (!titleEl.length) return
    const title = titleEl.text().trim()
    const href = titleEl.attr("href")
    if (!href) return
    const storyUrl = href.startsWith("http") ? href : `${url}/item?id=${storyId}`
    const scoreEl = $(`#score_${storyId}`)
    let hot: string | null = null
    if (scoreEl.length) {
      const m = scoreEl.text().match(/\d+/)
      if (m) hot = m[0]
    }
    items.push({
      id: storyId,
      title,
      hot,
      url: storyUrl,
      mobile_url: storyUrl,
    } as HotboardItem)
  })
  return items
}
