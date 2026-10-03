import type { HotboardItem } from "@shared/hotboard"
import * as cheerio from "cheerio"
import { httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "豆瓣"
export const DESC = "豆瓣讨论精选和豆瓣电影新片榜"
export const options = [
  { name: "type", default: "group", choices: ["group", "movie"], help: "榜单类型" },
]
export const TYPES: Record<string, string> = {
  group: "豆瓣讨论 - 讨论精选",
  movie: "豆瓣电影 - 新片榜",
}

function getNumbers(text?: string | null): number {
  if (!text) return 0
  const m = text.match(/\d+/)
  return m ? Number.parseInt(m[0], 10) : 0
}

async function fetchGroup(): Promise<HotboardItem[]> {
  const html = await httpGetText("https://www.douban.com/group/explore")
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $(".article .channel-item").each((_, el) => {
    const item = $(el)
    const link = item.find("h3 a")
    const urlHref = link.attr("href") ?? null
    const title = link.text().trim() || null
    const descEl = item.find(".block p")
    const desc = descEl.length ? descEl.text().trim() : null
    const timeEl = item.find("span.pubtime")
    const timeText = timeEl.length ? timeEl.text().trim() : null
    const hotEl = item.find(".likes")
    const hotText = hotEl.length ? hotEl.text().trim() : null
    const coverEl = item.find(".pic-wrap img")
    const cover = coverEl.length ? coverEl.attr("src") : null
    const topicId = getNumbers(urlHref)
    items.push({
      id: topicId,
      title,
      desc,
      time: getTime(timeText),
      hot: getNumbers(hotText),
      cover,
      url: urlHref,
      mobile_url: `https://m.douban.com/group/topic/${topicId}`,
    } as HotboardItem)
  })
  return items
}

async function fetchMovie(): Promise<HotboardItem[]> {
  const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  }
  const html = await httpGetText("https://movie.douban.com/chart/", headers)
  const $ = cheerio.load(html)
  const items: HotboardItem[] = []
  $(".article tr.item").each((_, el) => {
    const item = $(el)
    const link = item.find("a")
    const urlHref = link.attr("href") ?? null
    const movieTitle = link.attr("title") ?? null
    const scoreEl = item.find(".rating_nums")
    const scoreText = scoreEl.length ? scoreEl.text().trim() : null
    const score = scoreText ? `[豆瓣评分 ${scoreText}]` : "[暂无评分]"
    const title = movieTitle ? `${movieTitle} ${score}` : ""
    const coverEl = item.find("img")
    const cover = coverEl.length ? coverEl.attr("src") : null
    const descEl = item.find("p.pl")
    const desc = descEl.length ? descEl.text().trim() : null
    const hotEl = item.find("span.pl")
    const hotText = hotEl.length ? hotEl.text().trim() : null
    const hot = getNumbers(hotText)
    const movieId = getNumbers(urlHref)
    items.push({
      id: movieId,
      title,
      desc,
      cover,
      hot,
      url: urlHref,
      mobile_url: `https://m.douban.com/movie/subject/${movieId}/`,
    } as HotboardItem)
  })
  return items
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "group"
  return type === "movie" ? fetchMovie() : fetchGroup()
}
