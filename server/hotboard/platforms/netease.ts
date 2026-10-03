import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "网易新闻"
export const DESC = "网易新闻热点榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://m.163.com/fe/api/hot/news/flow"
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.list ?? []
  return list.map((item: any) => {
    const docId = item.docid ?? ""
    return {
      id: docId,
      title: item.title,
      cover: item.imgsrc,
      author: item.source,
      time: getTime(item.ptime),
      url: `https://www.163.com/dy/article/${docId}.html`,
      mobile_url: `https://m.163.com/dy/article/${docId}.html`,
    } as HotboardItem
  })
}
