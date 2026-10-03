import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGetText } from "../http"

export const PLATFORM_NAME = "快手"
export const DESC = "快手热榜"
const APOLLO_STATE_PREFIX = "window.__APOLLO_STATE__="

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.kuaishou.com/?isHome=1"
  const headers = {
    "User-Agent": UA_WIN_CHROME,
  }
  const html = await httpGetText(url, headers)
  const start = html.indexOf(APOLLO_STATE_PREFIX)
  if (start === -1) return []
  const slice = html.slice(start + APOLLO_STATE_PREFIX.length)
  const sA = slice.indexOf(";(function(")
  const sB = slice.indexOf("</script>")
  const cut = (sA !== -1 && sB !== -1) ? Math.min(sA, sB) : Math.max(sA, sB)
  if (cut === -1) return []
  const raw = slice.slice(0, cut).trim().replace(/;$/, "")
  const lastBrace = raw.lastIndexOf("}")
  const cleanRaw = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw
  const jsonObj = JSON.parse(cleanRaw)
  const defaultClient = jsonObj.defaultClient ?? {}
  const allItems: any[]
    = (defaultClient["$ROOT_QUERY.visionHotRank({\"page\":\"home\"})"] ?? {}).items
      || (defaultClient["$ROOT_QUERY.visionHotRank({\"page\":\"home\",\"platform\":\"web\"})"] ?? {}).items
      || []
  const items: HotboardItem[] = []
  for (const item of allItems) {
    const itemId = item.id ?? ""
    const data = defaultClient[itemId] ?? {}
    const photoIds = data.photoIds
    if (!photoIds) continue
    const photoJson = photoIds.json
    if (!photoJson || !Array.isArray(photoJson) || photoJson.length === 0) continue
    const photoId = photoJson[0]
    const poster = data.poster ?? ""
    items.push({
      id: data.id,
      title: data.name,
      cover: decodeURIComponent(poster),
      hot: data.hotValue,
      url: `https://www.kuaishou.com/short-video/${photoId}`,
      mobile_url: `https://www.kuaishou.com/short-video/${photoId}`,
    } as HotboardItem)
  }
  return items
}
