import type { HotboardItem } from "@shared/hotboard"
import { httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "虎嗅"
export const DESC = "虎嗅 24 小时"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://moment-api.huxiu.com/web-v3/moment/feed?platform=www"
  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.huxiu.com/moment/",
  }
  const text = await httpGetText(url, headers)
  const result: any = JSON.parse(text)
  const list: any[] = result?.data?.moment_list?.datalist ?? []
  return list.map((item: any) => {
    const content = (item.content ?? "").replace(/<br\s*\/?>/gi, "\n")
    const lines = content.split("\n").map((l: string) => l.trim()).filter(Boolean)
    const title = lines[0] ? lines[0].replace(/。$/, "") : ""
    const desc = lines.length > 1 ? lines.slice(1).join("\n") : null
    const id = item.object_id
    const user = item.user_info
    return {
      id,
      title,
      desc,
      author: user?.username ?? null,
      time: getTime(item.publish_time),
      hot: item.count_info?.agree_num ?? null,
      url: `https://www.huxiu.com/moment/${id}.html`,
      mobile_url: `https://m.huxiu.com/moment/${id}.html`,
    } as HotboardItem
  })
}
