import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"

export const PLATFORM_NAME = "虎扑"
export const DESC = "虎扑步行街热帖"
export const options = [
  { name: "type", default: "1", choices: ["1", "6", "11", "12", "612"], help: "话题类型" },
]
export const TYPES: Record<string, string> = {
  1: "主干道",
  6: "恋爱区",
  11: "校园区",
  12: "历史区",
  612: "摄影区",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "1"
  const url = `https://m.hupu.com/api/v2/bbs/topicThreads?topicId=${type}&page=1`
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.topicThreads ?? []
  return list.map((item: any) => {
    const tid = item.tid
    return {
      id: tid,
      title: item.title,
      author: item.username,
      hot: item.replies,
      url: `https://bbs.hupu.com/${tid}.html`,
      mobile_url: item.url ?? `https://bbs.hupu.com/${tid}.html`,
    } as HotboardItem
  })
}
