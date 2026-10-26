import type { HotboardItem } from "@shared/hotboard"
import { asText } from "@shared/hotboard"
import type { NewsItem } from "@shared/types"

/**
 * 看板条目的统一数据形态
 * 热榜平台（HotboardItem）与信息流源（NewsItem）字段各不相同，
 * 由调用方先映射成该结构，再交给 BoardRow 渲染，列表行样式只有一份实现。
 */
export interface BoardRowData {
  id?: string
  title?: string
  url?: string
  mobileUrl?: string
  cover?: string
  desc?: string
  author?: string
  time?: string
  hot?: string
  /** 右侧日期列，统计数据看板用 */
  date?: string
  hover?: string
}

/** 热榜条目 → 统一行数据（字段可能是对象，统一转成字符串避免渲染崩溃） */
export function hotboardRow(item: HotboardItem): BoardRowData {
  return {
    id: asText(item.id),
    title: asText(item.title),
    url: asText(item.url) || undefined,
    mobileUrl: asText(item.mobile_url) || undefined,
    cover: asText(item.cover) || undefined,
    desc: asText(item.desc),
    author: asText(item.author),
    time: asText(item.time),
    hot: asText(item.hot),
  }
}

/** 信息流条目 → 统一行数据 */
export function newsRow(item: NewsItem): BoardRowData {
  return {
    id: asText(item.id),
    title: asText(item.title),
    url: asText(item.url) || undefined,
    mobileUrl: asText(item.mobileUrl) || undefined,
    date: asText(item.pubDate),
    hover: asText(item.extra?.hover),
  }
}
