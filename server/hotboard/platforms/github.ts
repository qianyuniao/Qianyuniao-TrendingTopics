import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { httpGetText } from "../http"

export const PLATFORM_NAME = "GitHub"
export const DESC = "GitHub Trending"
export const options = [
  { name: "type", default: "daily", choices: ["daily", "weekly", "monthly"], help: "榜单分类" },
]
export const TYPES: Record<string, string> = { daily: "日榜", weekly: "周榜", monthly: "月榜" }

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const trend = params?.type ?? "daily"
  const url = `https://github.com/trending?since=${trend}`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Cache-Control": "max-age=0",
  }
  const html = await httpGetText(url, headers)
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []

  $("article.Box-row").each((_, el) => {
    const article = $(el)
    const repoH2 = article.find("h2").first()
    const anchor = repoH2.find("a").first()
    const full = repoH2.text().replace(/\r\n/g, "").replace(/\n/g, "").replace(/\s+/g, " ").trim()
    const parts = full.split("/").map(s => s.trim())
    const owner = parts[0] ?? ""
    const repo = parts[1] ?? ""
    const href = anchor.attr("href")
    if (!href) return

    const repoUrl = `https://github.com${href}`
    const descEl = article.find("p.col-9").first()
    const description = descEl.length ? descEl.text().trim() : null
    const langEl = article.find("[itemprop=programmingLanguage]").first()
    const language = langEl.length ? langEl.text().trim() : null
    const starsAnchor = article.find("a[href$=\"/stargazers\"]").first()
    const stars = starsAnchor.length ? starsAnchor.text().trim() : null
    const forksAnchor = article.find("a[href$=\"/forks\"]").first()
    const forks = forksAnchor.length ? forksAnchor.text().trim() : null

    const descParts: string[] = []
    if (description) descParts.push(`描述：${description}`)
    if (stars) descParts.push(`Stars:${stars}`)
    if (forks) descParts.push(`Forks:${forks}`)

    let title = `${owner}/${repo}`
    if (language) title = `[${language}] ${title}`

    items.push({
      id: repoUrl,
      title,
      desc: descParts.length ? descParts.join("\n") : null,
      hot: stars,
      url: repoUrl,
      mobile_url: repoUrl,
      author: owner,
    } as HotboardItem)
  })

  return items
}
