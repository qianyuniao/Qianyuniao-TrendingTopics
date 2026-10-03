import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "V2EX"
export const DESC = "V2EX 主题榜"
export const options = [
  { name: "type", default: "hot", choices: ["hot", "latest"], help: "主题类型" },
]
export const TYPES: Record<string, string> = { hot: "最热主题", latest: "最新主题" }

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "hot"
  const url = `https://www.v2ex.com/api/topics/${type}.json`
  const data: any[] = await httpGet(url)
  return (data ?? []).map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      desc: item.content,
      author: item.member?.username,
      time: getTime(item.created),
      hot: item.replies,
      url: item.url,
      mobile_url: item.url,
    } as HotboardItem
  })
}
