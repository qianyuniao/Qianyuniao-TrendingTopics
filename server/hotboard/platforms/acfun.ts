import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "AcFun"
export const DESC = "AcFun 排行榜"
export const options = [
  { name: "type", default: "-1", choices: ["-1", "155", "1", "60", "201", "58", "123", "59", "70", "68", "69", "125"], help: "频道类型" },
  { name: "range", default: "DAY", choices: ["DAY", "THREE_DAYS", "WEEK"], help: "时间范围" },
]
export const TYPES: Record<string, string> = {
  "-1": "综合",
  "155": "番剧",
  "1": "动画",
  "60": "娱乐",
  "201": "生活",
  "58": "音乐",
  "123": "舞蹈·偶像",
  "59": "游戏",
  "70": "科技",
  "68": "影视",
  "69": "体育",
  "125": "鱼塘",
  "DAY": "今日",
  "THREE_DAYS": "三日",
  "WEEK": "本周",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const channelType = params?.type ?? "-1"
  const timeRange = params?.range ?? "DAY"
  const channelId = channelType === "-1" ? "" : channelType
  const url = `https://www.acfun.cn/rest/pc-direct/rank/channel?channelId=${channelId}&rankLimit=30&rankPeriod=${timeRange}`
  const headers = {
    "Referer": `https://www.acfun.cn/rank/list/?cid=-1&pcid=${channelType}&range=${timeRange}`,
    "User-Agent": UA_WIN_CHROME,
  }
  const result: any = await httpGet(url, headers)
  const list: any[] = result?.rankList ?? []
  return list.map((item: any) => {
    const dougaId = item.dougaId
    return {
      id: dougaId,
      title: item.contentTitle,
      desc: item.contentDesc,
      cover: item.coverUrl,
      author: item.userName,
      time: getTime(item.contributeTime),
      hot: item.viewCountShow,
      url: `https://www.acfun.cn/v/ac${dougaId}`,
      mobile_url: item.shareUrl,
    } as HotboardItem
  })
}
