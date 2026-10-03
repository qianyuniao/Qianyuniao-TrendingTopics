import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { absUrl, pickText } from "../html"
import { httpGetText, httpPost } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "36 氪"
export const DESC = "36 氪快讯与榜单"
export const options = [
  { name: "type", default: "hot", choices: ["hot", "video", "comment", "collect"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = {
  hot: "人气榜",
  video: "视频榜",
  comment: "热议榜",
  collect: "收藏榜",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "hot"
  const items = await fetchNewsflashes()
  if (items.length) return items
  try {
    return await fetchGateway(type)
  } catch {
    return []
  }
}

async function fetchNewsflashes(): Promise<HotboardItem[]> {
  const url = "https://www.36kr.com/newsflashes"
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  }
  const html = await httpGetText(url, headers)
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $("div.newsflash-item").each((_, el) => {
    const item = $(el)
    const link = item.find("a.item-title").first()
    if (!link.length) return
    const title = link.text().trim()
    const href = link.attr("href")
    if (!title || !href) return
    const itemUrl = absUrl(href, "https://www.36kr.com")!
    items.push({
      id: itemUrl,
      title,
      desc: pickText(item, "div.item-desc"),
      time: getTime(pickText(item, "span.time")),
      url: itemUrl,
      mobile_url: itemUrl,
    } as HotboardItem)
  })
  return items
}

async function fetchGateway(type: string): Promise<HotboardItem[]> {
  const url = `https://gateway.36kr.com/api/mis/nav/home/nav/rank/${type}`
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Referer": "https://m.36kr.com/",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  }
  const body = {
    partner_id: "wap",
    param: { siteId: 1, platformId: 2 },
    timestamp: Date.now(),
  }
  const result: any = await httpPost(url, body, headers)
  const listKeys: Record<string, string> = {
    hot: "hotRankList",
    video: "videoList",
    comment: "remarkList",
    collect: "collectList",
  }
  const listKey = listKeys[type] ?? "hotRankList"
  const list: any[] = result?.data?.[listKey] ?? []
  return list.map((item: any) => {
    const material = item.templateMaterial ?? {}
    const itemId = item.itemId ?? ""
    return {
      id: itemId,
      title: material.widgetTitle,
      author: material.authorName,
      cover: material.widgetImage,
      time: getTime(item.publishTime),
      hot: material.statRead,
      url: `https://www.36kr.com/p/${itemId}`,
      mobile_url: `https://m.36kr.com/p/${itemId}`,
    } as HotboardItem
  })
}
