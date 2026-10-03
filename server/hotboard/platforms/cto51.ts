import type { HotboardItem } from "@shared/hotboard"
import md5 from "md5"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "51CTO"
export const DESC = "51CTO 推荐榜"

function md5hash(s: string): string {
  return md5(s)
}

async function getToken(): Promise<string> {
  const result: any = await httpGet("https://api-media.51cto.com/api/token-get")
  return result?.data?.data?.token ?? ""
}

function sign(requestPath: string, params: Record<string, any>, timestamp: number, token: string): string {
  params.timestamp = timestamp
  params.token = token
  const sortedKeys = Object.keys(params).sort()
  const sortedKeysStr = sortedKeys.join("")
  const pathHash = md5hash(requestPath)
  const tokenTimeHash = md5hash(token) + String(timestamp)
  const innerHash = md5hash(sortedKeysStr + tokenTimeHash)
  return md5hash(pathHash + innerHash)
}

export async function fetch(): Promise<HotboardItem[]> {
  const token = await getToken()
  const timestamp = Math.floor(Date.now() / 1000)
  const base: Record<string, any> = { page: 1, page_size: 50, limit_time: 0, name_en: "" }
  const requestPath = "index/index/recommend"
  const signature = sign(requestPath, { ...base }, timestamp, token)
  const queryParams: Record<string, any> = { ...base, timestamp, token, sign: signature }
  const queryStr = Object.entries(queryParams).map(([k, v]) => `${k}=${v}`).join("&")
  const url = `https://api-media.51cto.com/index/index/recommend?${queryStr}`
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.data?.list ?? []
  return list.map((item: any) => ({
    id: item.source_id,
    title: item.title,
    desc: item.abstract,
    cover: item.cover,
    time: getTime(item.pubdate),
    url: item.url,
    mobile_url: item.url,
  } as HotboardItem))
}
