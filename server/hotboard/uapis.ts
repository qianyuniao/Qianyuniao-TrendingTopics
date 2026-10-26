/**
 * uapis.cn 公共热榜聚合兜底
 * V2EX、NodeSeek 等站点在服务器网络下常无法直连（超时 / 反爬），
 * 改走聚合服务取数；返回结构统一为 { data: { list: [...] } }，
 * 接口失败时抛错，由 registry 统一转 502
 */
import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "./http"

export async function fetchUapisHotboard(type: string): Promise<HotboardItem[]> {
  const res: any = await httpGet(`https://uapis.cn/api/v1/misc/hotboard?type=${type}`)
  const list: any[] = res?.data?.list ?? res?.list ?? []
  return list.map((item: any) => ({
    id: item.extra?.id ?? item.url ?? item.title ?? null,
    title: item.title ?? null,
    desc: null,
    author: item.extra?.author ?? null,
    time: null,
    hot: item.hot_value || null,
    cover: null,
    url: item.url ?? null,
    mobile_url: item.url ?? null,
  } satisfies HotboardItem))
}
