import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { absUrl, pickAttr, pickText } from "../html"
import { httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "GameRes 游资网"
export const DESC = "GameRes 游资网最新资讯"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.gameres.com"
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  }
  const html = await httpGetText(url, headers)
  const $ = cheerio.load(html)
  const container = $(".news-tabs__pane.is-active").first()
  let articles = container.length ? container.find("article.feed-item") : $(".feed-item")
  if (!articles.length) articles = $(".feed-item")
  const items: HotboardItem[] = []
  articles.each((_, el) => {
    const article = $(el)
    let link = article.find("a.feed-item-title-a").first()
    if (!link.length) link = article.find("a.feed-item-thumb__link").first()
    if (!link.length) return
    const href = link.attr("href")
    if (!href) return
    const title = pickText(article, "span.feed-item-title-text") ?? (link.attr("aria-label") || "").trim()
    if (!title) return
    const itemUrl = absUrl(href, "https://www.gameres.com")!
    items.push({
      id: itemUrl,
      title,
      desc: pickText(article, "p.feed-item-summary"),
      time: getTime(pickText(article, "time.feed-item-time")),
      url: itemUrl,
      mobile_url: itemUrl,
      cover: pickAttr(article, "img.thumb", "src") ?? pickAttr(article, "img.thumb", "data-original"),
    } as HotboardItem)
  })
  return items
}
