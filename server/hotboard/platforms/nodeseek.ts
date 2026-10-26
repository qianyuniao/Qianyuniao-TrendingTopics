/**
 * 热榜平台源：NodeSeek —— NodeSeek 热门帖子
 * rss.nodeseek.com 在服务器网络下无法直连，改走 uapis 聚合取数
 */
import type { HotboardItem } from "@shared/hotboard"
import { fetchUapisHotboard } from "../uapis"

export const PLATFORM_NAME = "NodeSeek"
export const DESC = "NodeSeek 热门帖子"

export async function fetch(): Promise<HotboardItem[]> {
  return fetchUapisHotboard("nodeseek")
}
