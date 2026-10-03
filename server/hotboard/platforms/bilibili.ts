import type { HotboardItem } from "@shared/hotboard"
import { toHttps } from "../html"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "哔哩哔哩"
export const DESC = "哔哩哔哩热门榜单"
export const options = [
  { name: "type", default: "0", choices: ["0", "1", "3", "4", "5", "188", "119", "129", "155", "160", "168", "181"], help: "分类类型" },
]
export const TYPES: Record<string, string> = {
  0: "全站",
  1: "动画",
  3: "音乐",
  4: "游戏",
  5: "娱乐",
  188: "科技",
  119: "鬼畜",
  129: "舞蹈",
  155: "时尚",
  160: "生活",
  168: "国创相关",
  181: "影视",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const typeId = params?.type ?? "0"
  const url = `https://api.bilibili.com/x/web-interface/ranking?rid=${typeId}&type=all`
  const headers = {
    "Referer": "https://www.bilibili.com",
    "User-Agent": UA_WIN_CHROME,
  }
  const result: any = await httpGet(url, headers)
  const list: any[] = result?.data?.list ?? []
  return list.map((item: any) => {
    const bvid = item.bvid
    const pic = toHttps(item.pic)
    return {
      id: bvid,
      title: item.title,
      cover: pic,
      author: item.author,
      hot: item.play,
      url: `https://www.bilibili.com/video/${bvid}`,
      mobile_url: `https://m.bilibili.com/video/${bvid}`,
    } as HotboardItem
  })
}
