import type { HotboardItem } from "@shared/hotboard"
import { UA_MAC_CHROME, httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "中国地震台"
export const DESC = "中国地震台地震速报"
export const options = [
  { name: "days", default: "7", help: "查询天数" },
  { name: "range", default: "china", choices: ["china", "world"], help: "地理区域" },
]
export const TYPES: Record<string, string> = { china: "中国范围", world: "世界范围" }

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const days = Number(params?.days ?? 7)
  const range = params?.range ?? "china"
  const locationRange = range === "world" ? "" : "1"
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - days * 86400000)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}+${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
  let url = `https://www.cenc.ac.cn/prodlaunch-web-backend/open/data/catalogs?orderBy=id&isAsc=false&startMg=3&endMg=10&startTime=${fmt(startTime)}&endTime=${fmt(endTime)}`
  if (locationRange) url += `&locationRange=${locationRange}`
  const headers = {
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Pragma": "no-cache",
    "Referer": "https://www.cenc.ac.cn/earthquake-manage-publish-web/search",
    "User-Agent": UA_MAC_CHROME,
    "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"",
  }
  const result: any = await httpGet(url, headers)
  const list: any[] = result?.data ?? []
  return list.map((item: any) => {
    const id = item.id
    const location = item.locName
    const magnitude = item.magnitude
    const originTime = item.oriTime
    const parts = [
      `发震时刻 (UTC+8)：${originTime}`,
      `参考位置：${location}`,
      `震级 (M)：${magnitude}`,
      `纬度 (°)：\`${item.epiLat}\``,
      `经度 (°)：\`${item.epiLon}\``,
      `深度 (千米)：\`${item.focDepth}\``,
    ]
    const url2 = `https://www.cenc.ac.cn/earthquake-manage-publish-web/product-list/${id}/summarize`
    return {
      id,
      title: `${location} 发生 ${magnitude} 级地震`,
      desc: parts.join("\n"),
      time: getTime(originTime),
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
