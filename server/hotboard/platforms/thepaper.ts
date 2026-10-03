import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "澎湃新闻"
export const DESC = "澎湃新闻热榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar"
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.hotNews ?? []
  return list.map((item: any) => {
    const contId = item.contId ?? ""
    return {
      id: contId,
      title: item.name,
      cover: item.pic,
      hot: item.praiseTimes,
      time: getTime(item.pubTimeLong),
      url: `https://www.thepaper.cn/newsDetail_forward_${contId}`,
      mobile_url: `https://m.thepaper.cn/newsDetail_forward_${contId}`,
    } as HotboardItem
  })
}
