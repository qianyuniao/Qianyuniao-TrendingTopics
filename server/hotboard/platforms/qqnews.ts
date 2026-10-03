import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "腾讯新闻"
export const DESC = "腾讯新闻热点榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50"
  const result: any = await httpGet(url)
  const idlist: any[] = result?.idlist ?? []
  if (!idlist.length) return []
  const newslist: any[] = idlist[0].newslist ?? []
  const itemList = newslist.length > 1 ? newslist.slice(1) : newslist
  return itemList.map((item: any) => {
    const itemId = item.id ?? ""
    return {
      id: itemId,
      title: item.title,
      desc: item.abstract,
      cover: item.miniProShareImage,
      author: item.source,
      hot: item.hotEvent?.hotScore,
      time: getTime(item.timestamp),
      url: `https://new.qq.com/rain/a/${itemId}`,
      mobile_url: `https://view.inews.qq.com/k/${itemId}`,
    } as HotboardItem
  })
}
