/**
 * 热榜平台源：掘金 —— 掘金热门文章
 * 返回该平台的实时榜单条目，由 server/hotboard/registry.ts 统一调度
 */
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
  // 旧的 recommend_all_feed 接口对 GET 请求返回错误对象而非数组（list.map 崩溃），
  // 改用公开且支持 GET 的 article_rank 热榜接口
  const url = `https://api.juejin.cn/content_api/v1/content/article_rank?category_id=${category}&type=hot`
  const result: any = await httpGet(url)
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const content = item.content ?? {}
    const articleId = content.content_id ?? ""
    return {
      id: articleId,
      title: content.title,
      desc: content.brief,
      author: item.author?.name,
      hot: item.content_counter?.digg,
      time: getTime(content.ctime),
      url: `https://juejin.cn/post/${articleId}`,
      mobile_url: `https://juejin.cn/post/${articleId}`,
    } as HotboardItem
  })
}
