import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"

export const PLATFORM_NAME = "今日头条"
export const DESC = "今日头条热榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc"
  const result: any = await httpGet(url)
  const data: any[] = result?.data ?? []
  return data.map((item: any) => ({
    id: item.ClusterIdStr,
    title: item.Title,
    cover: item.Image?.url,
    hot: Number(item.HotValue),
    url: `https://www.toutiao.com/trending/${item.ClusterIdStr}/`,
    mobile_url: `https://api.toutiaoapi.com/feoffline/amos_land/new/html/main/index.html?topic_id=${item.ClusterIdStr}`,
  } as HotboardItem))
}
