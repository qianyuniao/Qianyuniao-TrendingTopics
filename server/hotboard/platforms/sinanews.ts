import type { HotboardItem } from "@shared/hotboard"
import { httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "新浪新闻"
export const DESC = "新浪新闻"
export const options = [
  { name: "type", default: "1", choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = {
  1: "总排行",
  2: "视频排行",
  3: "图片排行",
  4: "国内新闻",
  5: "国际新闻",
  6: "社会新闻",
  7: "体育新闻",
  8: "财经新闻",
  9: "娱乐新闻",
  10: "科技新闻",
  11: "军事新闻",
}

const RANK_CONFIGS: Record<string, { name: string, www: string, params: string }> = {
  1: { name: "总排行", www: "news", params: "www_www_all_suda_suda" },
  2: { name: "视频排行", www: "news", params: "video_news_all_by_vv" },
  3: { name: "图片排行", www: "news", params: "total_slide_suda" },
  4: { name: "国内新闻", www: "news", params: "news_china_suda" },
  5: { name: "国际新闻", www: "news", params: "news_world_suda" },
  6: { name: "社会新闻", www: "news", params: "news_society_suda" },
  7: { name: "体育新闻", www: "sports", params: "sports_suda" },
  8: { name: "财经新闻", www: "finance", params: "finance_0_suda" },
  9: { name: "娱乐新闻", www: "ent", params: "ent_suda" },
  10: { name: "科技新闻", www: "tech", params: "tech_news_suda" },
  11: { name: "军事新闻", www: "news", params: "news_mil_suda" },
}

function parseJsonp(data: string): any {
  const prefix = "var data = "
  const jsonStr = data.slice(prefix.length).trim().replace(/;$/, "")
  return JSON.parse(jsonStr)
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const rankType = params?.type ?? "1"
  const config = RANK_CONFIGS[rankType]
  const d = new Date()
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  const url = `https://top.${config.www}.sina.com.cn/ws/GetTopDataList.php?top_type=day&top_cat=${config.params}&top_time=${dateStr}&top_show_num=50`
  const text = await httpGetText(url)
  const data = parseJsonp(text)
  const list: any[] = data?.data ?? []
  return list.map((item: any) => {
    const url2 = item.url ?? ""
    return {
      id: item.id,
      title: item.title,
      author: item.media,
      hot: item.top_num,
      time: getTime(item.time),
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
