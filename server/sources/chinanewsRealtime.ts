import dayjs from "dayjs/esm"
import * as cheerio from "cheerio"

/**
 * 中国新闻网滚动要闻
 * 首页服务端渲染，正文链接形如 https://www.chinanews.com.cn/<频道>/<年>/<月-日>/<id>.shtml，
 * 日期可直接从 URL 中解析，故无需依赖列表页的时间文案
 */
export default defineSource(async () => {
  const today = dayjs().format("YYYY-MM-DD")
  const html: string = await myFetch("https://www.chinanews.com/")
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  const seen = new Set<string>()

  $("a[href]").each((_, el) => {
    const a = $(el)
    const href = (a.attr("href") ?? "").trim()
    const title = a.text().replace(/\s+/g, " ").trim()
    if (!/\.shtml$/.test(href)) return
    if (title.length < 8 || seen.has(href)) return

    const url = href.startsWith("//")
      ? `https:${href}`
      : href.startsWith("/")
        ? `https://www.chinanews.com.cn${href}`
        : href
    if (!/^https:\/\/(?:www\.)?chinanews\.com\.cn\//.test(url)) return

    // URL 内含 /2026/10-23/ 形式的发布日期
    const matched = /(20\d{2})\/(\d{2})-(\d{2})\//.exec(url)

    seen.add(href)
    news.push({
      id: url,
      title,
      url,
      pubDate: matched ? `${matched[1]}-${matched[2]}-${matched[3]}` : today,
    })
  })

  if (!news.length) throw new Error("无法获取中国新闻网要闻")
  return news.slice(0, 30)
})
