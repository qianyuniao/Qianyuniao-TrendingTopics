import type { HotboardItem } from "@shared/hotboard"
import { toHttps } from "../html"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "爱奇艺"
export const DESC = "爱奇艺热播榜"

// 爱奇艺按频道返回「推荐/热播」列表（免鉴权，返回真实影视条目）
// channel_id：1=电影 2=电视剧 4=动漫 6=综艺
const CHANNEL_IDS = [1, 2, 4, 6]

/** 上游部分字段可能是对象/数组，统一安全转成字符串，避免前端把它当 React child 渲染 */
function asText(value: any): string | null {
  if (value == null) return null
  if (typeof value === "string") return value || null
  if (typeof value === "number") return String(value)
  return null
}

/** 爱奇艺 people 形如 { main_charactor: [{ name }] }，拼成演员串 */
function actorsOf(people: any): string | null {
  if (typeof people === "string") return people || null
  const names = people?.main_charactor?.map((x: any) => x?.name).filter(Boolean)
  return names?.length ? names.join(" / ") : null
}

export async function fetch(): Promise<HotboardItem[]> {
  const headers = {
    "Referer": "https://www.iqiyi.com/",
    "User-Agent": UA_WIN_CHROME,
  }
  const items: HotboardItem[] = []
  const seen = new Set<string>()

  for (const channelId of CHANNEL_IDS) {
    try {
      const url = `https://pcw-api.iqiyi.com/search/recommend/list?channel_id=${channelId}&data_type=1&mode=24&page_id=1&ret_num=30`
      const res: any = await httpGet(url, headers)
      const list: any[] = res?.data?.list ?? []
      for (const it of list) {
        const title = it.name ?? it.title
        if (!title) continue
        const key = String(it.albumId ?? it.tvId ?? title)
        if (seen.has(key)) continue
        seen.add(key)

        const cover = toHttps(it.imageUrl ?? it.albumImageUrl ?? it.smallCoverPic ?? null)

        let urlStr: string | null = it.playUrl ?? null
        if (!urlStr && it.tvId) urlStr = `https://www.iqiyi.com/v_${it.tvId}.html`
        else if (!urlStr && it.albumId) urlStr = `https://www.iqiyi.com/lib/m_${it.albumId}.html`
        urlStr = toHttps(urlStr)

        items.push({
          id: it.albumId ?? it.tvId ?? title,
          title: asText(title),
          desc: asText(it.description),
          author: actorsOf(it.people),
          cover,
          url: urlStr,
        } as HotboardItem)
      }
    } catch {
      // 单频道失败不影响其它频道
    }
  }

  return items
}
