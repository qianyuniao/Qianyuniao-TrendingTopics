import dayjs from "dayjs/esm"
import * as cheerio from "cheerio"

/**
 * 环球网滚动要闻
 * 首页服务端渲染，正文链接形如 //china.huanqiu.com/article/<id>
 * （部分为协议相对地址，需补 https:）
 */
export default defineSource(async () => {
  const today = dayjs().format("YYYY-MM-DD")
  const html: string = await myFetch("https://www.huanqiu.com/")
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  const seen = new Set<string>()

  $("a[href]").each((_, el) => {
    const a = $(el)
    const href = (a.attr("href") ?? "").trim()
    const title = a.text().replace(/\s+/g, " ").trim()
    if (!/\/article\/[A-Za-z0-9]+$/.test(href)) return
    if (title.length < 8 || seen.has(href)) return

    const url = href.startsWith("//")
      ? `https:${href}`
      : href.startsWith("/")
        ? `https://www.huanqiu.com${href}`
        : href
    if (!/^https:\/\/\w+\.huanqiu\.com\//.test(url)) return

    seen.add(href)
    news.push({
      id: url,
      title,
      url,
      pubDate: today,
    })
  })

  if (!news.length) throw new Error("无法获取环球网要闻")
  return news.slice(0, 30)
})
