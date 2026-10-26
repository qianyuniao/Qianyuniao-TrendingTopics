import { load } from "cheerio"
import type { HotboardItem } from "@shared/hotboard"
import { toHttps } from "../html"
import { UA_WIN_CHROME, httpGetText } from "../http"

export const PLATFORM_NAME = "PP视频"
export const DESC = "PP视频热播榜"

/**
 * PP视频榜单页为 SSR 渲染，条目结构：
 * <li class="pic-list-item" data-webImg="//...jpg">
 *   <a class="pic-list-link" pitcontent="片名" _href="http://v.pptv.com/show/xxx.html"></a>
 * </li>
 * 标题与链接都挂在 a 的属性上（页面无可见文字），封面取 li 的 data-webImg
 */
export async function fetch(): Promise<HotboardItem[]> {
  const html = await httpGetText("https://www.pptv.com/rank/index.html", {
    "Referer": "https://www.pptv.com/",
    "User-Agent": UA_WIN_CHROME,
  })
  const $ = load(html)
  const items: HotboardItem[] = []
  const seen = new Set<string>()

  $("li.pic-list-item").each((_, el) => {
    const li = $(el)
    const link = li.find("a.pic-list-link").first()
    if (!link.length) return

    const title = (link.attr("pitcontent") ?? "").trim()
    let href = (link.attr("_href") ?? "").trim()
    if (!href) {
      // 兜底：从 onclick="goToDetail('http://...')" 中取地址
      const matched = (link.attr("onclick") ?? "").match(/goToDetail\('([^']+)'\)/)
      if (matched) href = matched[1]
    }
    if (!title || !href || seen.has(href)) return
    seen.add(href)

    // 注意：cheerio 会把属性名小写化，data-webImg 需按 data-webimg 读取
    const webImg = li.attr("data-webImg") ?? li.attr("data-webimg") ?? null
    const cover = webImg?.startsWith("//") ? `https:${webImg}` : toHttps(webImg)

    items.push({
      id: href,
      title,
      cover,
      url: toHttps(href),
    } as HotboardItem)
  })

  return items
}
