import { load } from "cheerio"
import type { HotboardItem } from "@shared/hotboard"
import { toHttps } from "../html"
import { UA_WIN_CHROME, httpGetText } from "../http"

export const PLATFORM_NAME = "好看视频"
export const DESC = "好看视频热播榜"

// 好看视频首页为 SSR 渲染，直接解析 videoList 区块中的视频卡片
// （标题来自封面 img 的 alt，链接为 /v?vid=xxx）
export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://haokan.baidu.com/"
  const html = await httpGetText(url, {
    "Referer": "https://haokan.baidu.com/",
    "User-Agent": UA_WIN_CHROME,
  })
  const $ = load(html)
  const items: HotboardItem[] = []
  const seen = new Set<string>()

  $("a[href*=\"/v?vid=\"]").each((_, el) => {
    const a = $(el)
    const href = a.attr("href") ?? ""
    const img = a.find("img").first()
    const title = (img.attr("alt") ?? "").trim()
      || a.find("[class*=\"videoitem-bottom\"]").text().trim()
    const cover = img.attr("src") ?? null
    let vid: string | null = null
    try {
      vid = new URL(href, "https://haokan.baidu.com").searchParams.get("vid")
    } catch {
      vid = null
    }
    if (!title || !vid || seen.has(vid)) return
    seen.add(vid)
    const coverUrl = toHttps(cover)
    items.push({
      id: vid,
      title,
      cover: coverUrl,
      url: `https://haokan.baidu.com/v?vid=${vid}`,
    } as HotboardItem)
  })

  return items
}
