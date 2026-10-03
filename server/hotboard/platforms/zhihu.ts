import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "知乎"
export const DESC = "知乎热榜和知乎日报推荐榜"
export const options = [
  { name: "type", default: "hot", choices: ["hot", "daily"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = { hot: "热榜", daily: "日报" }

async function fetchHot(): Promise<HotboardItem[]> {
  const result: any = await httpGet("https://api.zhihu.com/topstory/hot-lists/total?limit=50")
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const target = item.target ?? {}
    const qid = (target.url ?? "").split("/").pop()
    const detail = item.detail_text ?? ""
    const children = item.children ?? []
    return {
      id: target.id,
      title: target.title,
      desc: target.excerpt,
      cover: children[0]?.thumbnail ?? null,
      time: target.created ? getTime(target.created) : null,
      hot: detail ? detail.split(" ")[0] : null,
      url: `https://www.zhihu.com/question/${qid}`,
      mobile_url: `https://www.zhihu.com/question/${qid}`,
    } as HotboardItem
  })
}

async function fetchDaily(): Promise<HotboardItem[]> {
  const headers = {
    Referer: "https://daily.zhihu.com/api/4/news/latest",
    Host: "daily.zhihu.com",
  }
  const result: any = await httpGet("https://daily.zhihu.com/api/4/news/latest", headers)
  const stories: any[] = (result?.stories ?? []).filter((s: any) => s.type === 0)
  return stories.map((item: any) => ({
    id: item.id,
    title: item.title,
    cover: item.images?.[0] ?? null,
    author: item.hint,
    url: item.url,
    mobile_url: item.url,
  } as HotboardItem))
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "hot"
  return type === "daily" ? fetchDaily() : fetchHot()
}
