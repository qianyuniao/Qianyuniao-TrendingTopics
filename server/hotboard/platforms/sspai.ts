import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "少数派"
export const DESC = "少数派热门文章"
export const options = [
  {
    name: "type",
    default: "热门文章",
    choices: ["热门文章", "应用推荐", "生活方式", "效率技巧", "少数派播客"],
    help: "文章类型",
  },
]
export const TYPES: Record<string, string> = {
  热门文章: "热门文章",
  应用推荐: "应用推荐",
  生活方式: "生活方式",
  效率技巧: "效率技巧",
  少数派播客: "少数派播客",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "热门文章"
  const url = `https://sspai.com/api/v1/article/tag/page/get?limit=40&tag=${encodeURIComponent(type)}`
  const result: any = await httpGet(url)
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const id = item.id ?? ""
    return {
      id,
      title: item.title,
      desc: item.summary,
      author: item.author?.nickname,
      hot: item.like_count,
      time: getTime(item.released_time),
      url: `https://sspai.com/post/${id}`,
      mobile_url: `https://sspai.com/post/${id}`,
    } as HotboardItem
  })
}
