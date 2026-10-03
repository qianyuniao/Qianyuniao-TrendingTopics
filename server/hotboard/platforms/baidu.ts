import type { HotboardItem } from "@shared/hotboard"
import { httpGetText } from "../http"

export const PLATFORM_NAME = "百度"
export const DESC = "百度热搜"
export const options = [
  { name: "type", default: "realtime", choices: ["realtime", "novel", "movie", "teleplay", "car", "game"], help: "热搜类别" },
]
export const TYPES: Record<string, string> = {
  realtime: "热搜",
  novel: "小说",
  movie: "电影",
  teleplay: "电视剧",
  car: "汽车",
  game: "游戏",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const searchType = params?.type ?? "realtime"
  const url = `https://top.baidu.com/board?tab=${searchType}`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  }
  const html = await httpGetText(url, headers)
  const match = html.match(/<!--s-data:([\s\S]*?)-->/)
  if (!match) return []
  const sData = JSON.parse(match[1])
  const cards: any[] = sData?.data?.cards ?? []
  if (!cards.length) return []
  const content: any[] = cards[0]?.content ?? []
  return content.map((item: any) => ({
    title: item.word,
    desc: item.desc,
    cover: item.img,
    hot: item.hotScore,
    url: item.url,
    mobile_url: item.appUrl,
  } as HotboardItem))
}
