import process from "node:process"
import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "微信视频号"
export const DESC = "微信视频号热榜（官方未开放，需自备接口地址）"

/**
 * 微信视频号：官方没有公开的热榜接口。
 *
 * 现状说明：
 * - 视频号内容完全在微信客户端内，`channels.weixin.qq.com` 只是创作发布端，
 *   需扫码登录且没有热榜 API，服务端抓不到榜单数据。
 * - 市面上能拿到视频号榜单的都是商业数据平台（新榜、友望、蝉妈妈等），
 *   均需付费账号且接口各不相同，无法作为内置源。
 *
 * 因此默认返回空列表（看板只展示官网入口，不显示伪造数据）。
 * 若你有可用的视频号榜单接口，在 .env.server 配置 WEIXIN_CHANNELS_API_URL
 * 即可接入；接口返回 `{ data: { list: [...] } }` 或 `{ list: [...] }` 均可解析，
 * 条目字段取 title / name、hot / heat、url、id。
 */
export async function fetch(): Promise<HotboardItem[]> {
  const apiUrl = process.env.WEIXIN_CHANNELS_API_URL
  if (!apiUrl) return []

  const headers: Record<string, string> = {
    "User-Agent": UA_WIN_CHROME,
    "Referer": "https://channels.weixin.qq.com/",
  }
  if (process.env.WEIXIN_CHANNELS_COOKIE) {
    headers.Cookie = process.env.WEIXIN_CHANNELS_COOKIE
  }

  try {
    const res: any = await httpGet(apiUrl, headers)
    const list: any[] = res?.data?.list ?? res?.list ?? []
    return list.map((it: any, idx: number): HotboardItem => ({
      id: it.id ?? it.title ?? idx,
      title: it.title ?? it.name ?? null,
      desc: it.desc ?? null,
      author: it.author ?? null,
      time: it.time ?? null,
      hot: it.hot ?? it.heat ?? null,
      cover: it.cover ?? null,
      url: it.url ?? null,
      mobile_url: it.mobile_url ?? null,
    }))
  } catch {
    // 自备接口不可用时不让看板报错，退回空列表
    return []
  }
}
