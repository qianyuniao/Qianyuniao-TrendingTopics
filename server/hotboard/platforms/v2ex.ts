/**
 * 热榜平台源：V2EX —— V2EX 热议主题
 * www.v2ex.com 在服务器网络下无法直连，改走 uapis 聚合取数
 */
import type { HotboardItem } from "@shared/hotboard"
import { fetchUapisHotboard } from "../uapis"

export const PLATFORM_NAME = "V2EX"
export const DESC = "V2EX 热议主题"

export async function fetch(): Promise<HotboardItem[]> {
  return fetchUapisHotboard("v2ex")
}
