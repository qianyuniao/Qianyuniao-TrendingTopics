/**
 * 信息流源：凤凰网
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const html: string = await myFetch("https://www.ifeng.com/")
  const regex = /var\s+allData\s*=\s*(\{[\s\S]*?\});/
  const match = regex.exec(html)
  const news: NewsItem[] = []
  if (match) {
    const realData = JSON.parse(match[1])
    const rawNews = realData.hotNews1 as {
      url: string
      title: string
      newsTime: string
    }[]
    rawNews.forEach((hotNews) => {
      news.push({
        id: hotNews.url,
        url: hotNews.url,
        title: hotNews.title,
        extra: {
          date: hotNews.newsTime,
        },
      })
    })
  }
  return news
})
