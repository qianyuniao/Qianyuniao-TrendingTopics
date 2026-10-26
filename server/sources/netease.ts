import dayjs from "dayjs/esm"
import * as cheerio from "cheerio"

/**
 * 网易新闻热榜
 * 首页为服务端渲染，正文链接统一形如 https://www.163.com/<频道>/article/<id>.html
 * 首页链接混杂大量导航与推广位，故用正文 URL 规则 + 标题长度过滤
 */
export default defineSource(async () => {
  const today = dayjs().format("YYYY-MM-DD")
  const html: string = await myFetch("https://news.163.com/")
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  const seen = new Set<string>()

  $("a[href]").each((_, el) => {
    const a = $(el)
    const href = (a.attr("href") ?? "").trim()
    const title = a.text().replace(/\s+/g, " ").trim()
    // 只看正文页，且标题足够长（过滤「新闻」「财经」这类频道短链）
    if (!/\/article\/[A-Za-z0-9]+\.html$/.test(href)) return
    if (title.length < 8 || seen.has(href)) return

    const url = href.startsWith("//")
      ? `https:${href}`
      : href.startsWith("/")
        ? `https://www.163.com${href}`
        : href
    if (!url.startsWith("https://www.163.com/")) return

    seen.add(href)
    news.push({
      id: url,
      title,
      url,
      pubDate: today,
    })
  })

  if (!news.length) throw new Error("无法获取网易新闻热榜")
  return news.slice(0, 30)
})
