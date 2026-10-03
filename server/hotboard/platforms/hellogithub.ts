import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "HelloGitHub"
export const DESC = "HelloGitHub 热门仓库"
export const options = [
  { name: "sort", default: "featured", choices: ["featured", "all"], help: "排序类型" },
]
export const TYPES: Record<string, string> = { featured: "精选", all: "全部" }

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const sort = params?.sort ?? "featured"
  const url = `https://abroad.hellogithub.com/v1/?sort_by=${sort}&tid=&page=1`
  const result: any = await httpGet(url)
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const id = item.item_id
    return {
      id,
      title: item.title,
      desc: item.summary,
      time: getTime(item.updated_at),
      hot: item.clicks_total,
      url: `https://hellogithub.com/repository/${id}`,
      mobile_url: `https://hellogithub.com/repository/${id}`,
      author: item.author,
    } as HotboardItem
  })
}
