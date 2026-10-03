import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "极客公园"
export const DESC = "极客公园热门文章"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://mainssl.geekpark.net/api/v2"
  const result: any = await httpGet(url)
  const list: any[] = result?.homepage_posts ?? []
  return list.map((item: any) => {
    const post = item.post ?? {}
    const authors: any[] = post.authors ?? []
    const author = authors.length ? authors[0]?.nickname : null
    const id = post.id
    return {
      id,
      title: post.title,
      desc: post.abstract,
      time: getTime(post.published_timestamp),
      hot: post.views,
      url: `https://www.geekpark.net/news/${id}`,
      mobile_url: `https://www.geekpark.net/news/${id}`,
      cover: post.cover_url,
      author,
    } as HotboardItem
  })
}
