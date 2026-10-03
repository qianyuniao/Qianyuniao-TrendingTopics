import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"

export const PLATFORM_NAME = "新浪网"
export const DESC = "新浪网热榜"
export const options = [
  { name: "type", default: "all", choices: ["all", "hotcmnt", "minivideo", "ent", "ai", "auto", "mother", "fashion", "travel", "esg"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = {
  all: "新浪热榜",
  hotcmnt: "热议榜",
  minivideo: "视频热榜",
  ent: "娱乐热榜",
  ai: "AI 热榜",
  auto: "汽车热榜",
  mother: "育儿热榜",
  fashion: "时尚热榜",
  travel: "旅游热榜",
  esg: "ESG 热榜",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const rankType = params?.type ?? "all"
  const url = `https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-${rankType}`
  const data: any = await httpGet(url)
  const hotList: any[] = data?.data?.hotList ?? []
  return hotList.map((item: any) => {
    const base = item.base?.base ?? {}
    const info = item.info ?? {}
    const url2 = base.url ?? ""
    return {
      id: base.uniqueId,
      title: info.title,
      hot: info.hotValue,
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
