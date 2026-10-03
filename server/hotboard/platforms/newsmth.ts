import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "水木社区"
export const DESC = "水木社区热门话题"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://wap.newsmth.net/wap/api/hot/global"
  const result: any = await httpGet(url)
  const topics: any[] = result?.data?.topics ?? []
  return topics.map((topic: any) => {
    const article = topic.article ?? {}
    const topicId = article.topicId ?? ""
    const boardTitle = topic.board?.title
    const articleUrl = `https://wap.newsmth.net/article/${topicId}?title=${encodeURIComponent(boardTitle ?? "")}&from=home`
    return {
      id: topic.firstArticleId,
      title: article.subject,
      desc: article.body,
      author: article.account?.name,
      time: getTime(article.postTime),
      url: articleUrl,
      mobile_url: articleUrl,
    } as HotboardItem
  })
}
