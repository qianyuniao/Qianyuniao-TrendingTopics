import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "数字尾巴"
export const DESC = "数字尾巴热门文章"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://opser.api.dgtle.com/v2/news/index"
  const result: any = await httpGet(url)
  const list: any[] = result?.items ?? []
  return list.map((item: any) => {
    const id = item.id
    return {
      id,
      title: item.title,
      desc: item.content,
      cover: item.cover,
      author: item.from,
      time: getTime(item.created_at),
      hot: item.membernum,
      url: `https://www.dgtle.com/news-${id}-${item.type}.html`,
      mobile_url: `https://m.dgtle.com/news-details/${id}`,
    } as HotboardItem
  })
}
