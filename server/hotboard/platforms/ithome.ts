import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { httpGetText } from "../http"

export const PLATFORM_NAME = "IT 之家"
export const DESC = "IT 之家热榜和喜加一"
export const options = [
  { name: "type", default: "hot", choices: ["hot", "xijiayi"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = { hot: "热榜", xijiayi: "喜加一" }

function replaceLinkHot(url?: string | null, getId = false): string | null {
  if (!url) return null
  const m = url.match(/[html|ive]\/(\d+)\.htm/)
  if (m) {
    const articleId = m[1]
    if (getId) return articleId
    return `https://www.ithome.com/0/${articleId.slice(0, 3)}/${articleId.slice(3)}.htm`
  }
  return url
}

function replaceLinkXijiayi(url?: string | null, getId = false): string | null {
  if (!url) return null
  const m = url.match(/https:\/\/www\.ithome\.com\/0\/(\d+)\/(\d+)\.htm/)
  if (m) {
    if (getId) return `${m[1]}${m[2]}`
    return `https://m.ithome.com/html/${m[1]}${m[2]}.htm`
  }
  return url
}

async function fetchHot(): Promise<HotboardItem[]> {
  const html = await httpGetText("https://m.ithome.com/rankm/")
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $(".rank-box .placeholder").each((_, el) => {
    const item = $(el)
    const aTag = item.find("a").first()
    const href = aTag.attr("href") ?? null
    const titleTag = item.find(".plc-title").first()
    const title = titleTag.length ? titleTag.text().trim() : null
    const coverTag = item.find("img").first()
    const coverAttr = coverTag.length ? coverTag.attr("data-original") : null
    const cover = coverAttr ?? null
    const timeTag = item.find("span.post-time").first()
    const timeText = timeTag.length ? timeTag.text().trim() : null
    const reviewTag = item.find(".review-num").first()
    const reviewText = reviewTag.length ? reviewTag.text().trim() : null
    const articleId = replaceLinkHot(href, true)
    const urlPc = replaceLinkHot(href)
    items.push({
      id: articleId,
      title,
      cover,
      time: timeText,
      hot: reviewText,
      url: urlPc,
      mobile_url: urlPc,
    } as HotboardItem)
  })
  return items
}

async function fetchXijiayi(): Promise<HotboardItem[]> {
  const html = await httpGetText("https://www.ithome.com/zt/xijiayi")
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $(".newslist li").each((_, el) => {
    const item = $(el)
    const aTag = item.find("a").first()
    const href = aTag.attr("href") ?? null
    const titleTag = item.find(".newsbody h2").first()
    const title = titleTag.length ? titleTag.text().trim() : null
    const descTag = item.find(".newsbody p").first()
    const desc = descTag.length ? descTag.text().trim() : null
    const coverTag = item.find("img").first()
    const coverAttr = coverTag.length ? coverTag.attr("data-original") : null
    const cover = coverAttr ?? null
    let timeStr: string | null = null
    const timeTag = item.find("span.time").first()
    if (timeTag.length) {
      const m = timeTag.html()?.match(/'([^']+)'/)
      if (m) timeStr = m[1]
    }
    const commentTag = item.find(".comment").first()
    const commentText = commentTag.length ? commentTag.text().trim() : null
    const articleId = replaceLinkXijiayi(href, true)
    const urlMobile = replaceLinkXijiayi(href)
    items.push({
      id: articleId,
      title,
      desc,
      cover,
      time: timeStr,
      hot: commentText,
      url: href,
      mobile_url: urlMobile,
    } as HotboardItem)
  })
  return items
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "hot"
  return type === "xijiayi" ? fetchXijiayi() : fetchHot()
}
