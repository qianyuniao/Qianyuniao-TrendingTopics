/**
 * 服务端内部类型（客户端请用 @shared/types）
 * 涵盖 RSS 解析结果、缓存行、用户信息与数据源取数函数的签名
 */
import type { NewsItem, SourceID } from "@shared/types"

/** RSS / Atom 解析后的结构，由 utils/rss2json.ts 产出 */
export interface RSSInfo {
  title: string
  description: string
  link: string
  image: string
  updatedTime: string
  items: RSSItem[]
}
export interface RSSItem {
  title: string
  description: string
  link: string
  created?: string
}

export interface CacheInfo {
  id: SourceID
  items: NewsItem[]
  updated: number
}

export interface CacheRow {
  id: SourceID
  data: string
  updated: number
}

export interface UserInfo {
  id: string
  email: string
  type: "github"
  data: string
  created: number
  updated: number
}

export interface SourceOption {
  // default: false
  hiddenDate?: boolean
}

export type SourceGetter = () => Promise<NewsItem[]>
