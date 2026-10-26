/**
 * 信息流源：联合早报 —— 官网即时新闻
 * 原抓取的第三方镜像站 zaochenbao.com 已失效（超时），改抓官网列表页；
 * 文章链接形如 /news/china/story20261024-9888646，日期藏在 storyYYYYMMDD 中
 */
import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const base = "https://www.zaobao.com.sg"
  const html: string = await myFetch(`${base}/realtime/china`, { responseType: "text" })
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  const seen = new Set<string>()
  $("a[href*='/news/']").each((_, el) => {
    const href = $(el).attr("href")
    const title = $(el).text().trim().replace(/\s+/g, " ")
    if (!href || title.length < 8 || seen.has(href) || news.length >= 40) return
    seen.add(href)
    const date = /story(\d{8})-/.exec(href)?.[1]
    news.push({
      id: href,
      title,
      url: base + href,
      pubDate: date ? tranformToUTC(date, "YYYYMMDD") : undefined,
    })
  })
  return news
})
