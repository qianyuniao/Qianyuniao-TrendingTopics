import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { httpGetText } from "../http"

export const PLATFORM_NAME = "简书"
export const DESC = "简书热门推荐"

function getId(url: string): string {
  if (!url) return "undefined"
  const m = url.match(/([^/]+)$/)
  return m ? m[1] : "undefined"
}

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.jianshu.com/"
  const headers = { Referer: "https://www.jianshu.com" }
  const html = await httpGetText(url, headers)
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $("ul.note-list li").each((_, el) => {
    const item = $(el)
    const aTag = item.find("a").first()
    const hrefAttr = aTag.attr("href")
    const href = (hrefAttr && typeof hrefAttr === "string") ? hrefAttr : ""
    const aTitle = item.find("a.title").first()
    const title = aTitle.length ? aTitle.text().trim() : null
    const coverTag = item.find("img").first()
    const coverAttr = coverTag.length ? coverTag.attr("src") : null
    const cover = (coverAttr && typeof coverAttr === "string") ? coverAttr : null
    const descTag = item.find("p.abstract").first()
    const desc = descTag.length ? descTag.text().trim() : null
    const authorTag = item.find("a.nickname").first()
    const author = authorTag.length ? authorTag.text().trim() : null
    const articleId = getId(href)
    items.push({
      id: articleId,
      title,
      desc,
      cover,
      author,
      url: `https://www.jianshu.com${href}`,
      mobile_url: `https://www.jianshu.com${href}`,
    } as HotboardItem)
  })
  return items
}
