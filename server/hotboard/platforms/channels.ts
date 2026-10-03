import process from "node:process"
import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "微信视频号"
export const DESC = "微信视频号热搜（实验性，需配置 Cookie 与接口）"

// 微信视频号目前没有公开的网页端热榜接口，数据均在微信 App 登录态内。
// 这里预留接入口子：配置 WEIXIN_CHANNELS_COOKIE 后，将下方 url 替换为
// 实际可用的视频号热门/热搜接口即可启用。在获得可用接口前，返回空列表，
// 不污染看板。
export async function fetch(): Promise<HotboardItem[]> {
  const cookie = process.env.WEIXIN_CHANNELS_COOKIE
  if (!cookie) return []

  const headers: Record<string, string> = {
    "Cookie": cookie,
    "User-Agent": UA_WIN_CHROME,
    "Referer": "https://channels.weixin.qq.com/",
  }

  // TODO: 替换为真实的视频号热榜接口（当前 web 端无公开热榜 API）
  const url = "https://channels.weixin.qq.com/..."
  const res: any = await httpGet(url, headers)
  const list: any[] = res?.data?.list ?? []
  return list.map((it: any, idx: number) => ({
    id: it.id ?? idx,
    title: it.title ?? it.name ?? null,
    hot: it.hot ?? it.heat ?? null,
    url: it.url ?? null,
  } as HotboardItem))
}
