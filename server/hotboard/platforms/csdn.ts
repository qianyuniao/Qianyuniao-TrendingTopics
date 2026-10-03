import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "CSDN"
export const DESC = "CSDN 排行榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=30"
  const result: any = await httpGet(url)
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const picList: string[] = item.picList ?? []
    const url2 = item.articleDetailUrl
    return {
      id: item.productId,
      title: item.articleTitle,
      cover: picList[0] ?? null,
      author: item.nickName,
      time: getTime(item.period),
      hot: item.hotRankScore,
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
