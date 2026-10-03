import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "掘金"
export const DESC = "掘金热门文章"
export const options = [
  { name: "category", default: "1", help: "分类 ID（默认 1 = 综合）" },
]
export const TYPES: Record<string, string> = { 1: "综合" }

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const category = params?.category ?? "1"
  const url = `https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed?aid=2608&spider=0&limit=20&category_id=${category}`
  const result: any = await httpGet(url)
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const info = item.item_info ?? {}
    const articleId = info.article_id ?? ""
    return {
      id: articleId,
      title: info.title,
      desc: info.brief_content,
      author: info.author_user_info?.user_name,
      hot: info.interaction?.digg_count,
      time: getTime(info.ctime),
      url: `https://juejin.cn/post/${articleId}`,
      mobile_url: `https://juejin.cn/post/${articleId}`,
    } as HotboardItem
  })
}
