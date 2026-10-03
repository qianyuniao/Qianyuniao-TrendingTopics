import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { httpGetText } from "../http"

export const PLATFORM_NAME = "历史上的今天"
export const DESC = "历史上的今天"
export const options = [
  { name: "month", default: null, help: "月份（默认当前月份）" },
  { name: "day", default: null, help: "日期（默认当前日期）" },
]

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const now = new Date()
  const month = Number(params?.month ?? now.getMonth() + 1)
  const day = Number(params?.day ?? now.getDate())
  const ms = String(month).padStart(2, "0")
  const ds = String(day).padStart(2, "0")
  const url = `https://baike.baidu.com/cms/home/eventsOnHistory/${ms}.json?_=${Date.now()}`
  const text = await httpGetText(url)
  const result = JSON.parse(text)
  const dataList: any[] = result?.[ms]?.[`${ms}${ds}`] ?? []
  return dataList.map((item: any) => {
    const title = item.title ? cheerio.load(item.title).text().trim() : ""
    const desc = item.desc ? cheerio.load(item.desc).text().trim() : ""
    return {
      title,
      desc,
      cover: item.cover ? item.pic_share : null,
      author: item.year,
      url: item.link,
      mobile_url: item.link,
    } as HotboardItem
  })
}
