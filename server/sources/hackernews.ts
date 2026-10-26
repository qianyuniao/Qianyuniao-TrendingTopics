/**
 * 信息流源：Hacker News
 * news.ycombinator.com 直连超时，改走官方搜索服务 Algolia 的 front_page 接口
 */
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const res: any = await myFetch("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30")
  return (res?.hits ?? []).map((hit: any): NewsItem => {
    const id = hit.objectID
    return {
      id,
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${id}`,
      pubDate: hit.created_at ? new Date(hit.created_at).valueOf() : undefined,
      extra: {
        info: hit.points != null ? `${hit.points} points` : undefined,
      },
    }
  })
})
