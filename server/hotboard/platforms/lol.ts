import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "英雄联盟"
export const DESC = "英雄联盟更新公告"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=json&page=1&num=30&target=24&source=web_pc"
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.result ?? []
  return list.map((item: any) => {
    const docId = item.iDocID ?? ""
    const img = item.sIMG ?? ""
    const url2 = `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(docId)}`
    return {
      id: docId,
      title: item.sTitle,
      cover: img ? `https:${img}` : null,
      author: item.sAuthor,
      hot: item.iTotalPlay,
      time: getTime(item.sCreated),
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
