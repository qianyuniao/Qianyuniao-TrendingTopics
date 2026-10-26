import type { HotboardItem } from "@shared/hotboard"
import { toHttps } from "../html"
import { UA_WIN_CHROME, httpGetText } from "../http"

export const PLATFORM_NAME = "腾讯视频"
export const DESC = "腾讯视频频道热播"

/**
 * 腾讯视频旧接口（v.qq.com/x/bu/*）已整体下线，改为解析频道页 SSR 数据。
 * 频道页（https://v.qq.com/channel/<id>）是服务端渲染，条目以 JS 对象字面量
 * 内嵌在 HTML 中，字段形如：
 *   { ..., mzTitle:"片名", subTitle:"简介", coverPic:"https://tv.puui.qpic.cn/...",
 *     cutJumpUrl:"https://v.qq.com/x/cover/mzc00200xxxxxxx.html" }
 * 以 mzTitle 为锚点，在紧随的窗口内取封面与 cover 链接。
 *
 * 注：综艺频道页的推荐条目不携带 cover 链接字段，无法构造可点击地址，暂不支持。
 */
export const options = [
  {
    name: "channel",
    default: "tv",
    choices: ["tv", "movie", "cartoon"],
    help: "频道",
  },
]

export const TYPES: Record<string, string> = {
  tv: "电视剧",
  movie: "电影",
  cartoon: "动漫",
}

/** 取 mzTitle 之后最近的封面与 cover 链接，避免串到相邻条目 */
const WINDOW = 6000

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const channel = TYPES[params?.channel as string] ? String(params?.channel) : "tv"
  const html = await httpGetText(`https://v.qq.com/channel/${channel}`, {
    "Referer": "https://v.qq.com/",
    "User-Agent": UA_WIN_CHROME,
  })

  const items: HotboardItem[] = []
  const seen = new Set<string>()

  for (const matched of html.matchAll(/mzTitle:"([^"]{1,80})"/g)) {
    const title = matched[1].trim()
    if (!title) continue

    const window = html.slice(matched.index ?? 0, (matched.index ?? 0) + WINDOW)
    const cid = window.match(/x\/cover\/([a-z0-9]+)\.html/)?.[1]
    if (!cid || seen.has(cid)) continue
    seen.add(cid)

    const pic = window.match(/coverPic:"(https:\/\/[^"]+)"/)?.[1]
    const subTitle = window.match(/subTitle:"([^"]{1,120})"/)?.[1]

    items.push({
      id: cid,
      title,
      desc: subTitle ?? null,
      cover: toHttps(pic?.replace(/\\u002F/g, "/") ?? null),
      url: `https://v.qq.com/x/cover/${cid}.html`,
      mobile_url: `https://m.v.qq.com/x/cover/${cid}.html`,
    } as HotboardItem)
  }

  return items
}
