/**
 * 全项目共享类型：客户端与服务端都从这里取类型，避免两边各定义一份
 * 源 id（SourceID / AllSourceID）由 pre-sources.ts 的常量推导，新增源无需改这里
 */
import type { colors } from "unocss/preset-mini"
import type { columns, fixedColumnIds } from "./metadata"
import type { originSources } from "./pre-sources"

/** 看板配色，限定为 UnoCSS 预设色（primary 为品牌色），保证卡片样式可控 */
export type Color = "primary" | Exclude<keyof typeof colors, "current" | "inherit" | "transparent" | "black" | "white">

type ConstSources = typeof originSources
type MainSourceID = keyof(ConstSources)

export type SourceID = {
  [Key in MainSourceID]: ConstSources[Key] extends { disable?: true } ? never :
    ConstSources[Key] extends { sub?: infer SubSource } ? {
    // @ts-expect-error >_<
      [SubKey in keyof SubSource]: SubSource[SubKey] extends { disable?: true } ? never : `${Key}-${SubKey}`
    }[keyof SubSource] | Key : Key;
}[MainSourceID]

/** 全部源 id（含被 disable 的），服务端注册源时用，保证禁用源也能被调度 */
export type AllSourceID = {
  [Key in MainSourceID]: ConstSources[Key] extends { sub?: infer SubSource } ? keyof {
    // @ts-expect-error >_<
    [SubKey in keyof SubSource as `${Key}-${SubKey}`]: never
  } | Key : Key
}[MainSourceID]

export type ColumnID = keyof typeof columns
export type Metadata = Record<ColumnID, Column>

export interface PrimitiveMetadata {
  updatedTime: number
  data: Record<FixedColumnID, SourceID[]>
  action: "init" | "manual" | "sync"
}

export type FixedColumnID = (typeof fixedColumnIds)[number]

/** 源定义的原始形态：主源可有若干 sub 子源（子源 id 为 `主源-子源`） */
export interface OriginSource extends Partial<Omit<Source, "name" | "redirect">> {
  name: string
  sub?: Record<string, {
    /**
     * Subtitle 小标题
     */
    title: string
  } & Partial<Omit<Source, "title" | "name" | "redirect">>>
}

export interface Source {
  name: string
  /**
   * 刷新的间隔时间
   */
  interval: number
  color: Color

  /**
   * Subtitle 小标题
   */
  title?: string
  desc?: string
  /**
   * Default normal timeline
   */
  type?: "hottest" | "realtime"
  column?: ColumnID
  home?: string
  /**
   * @default false
   */
  disable?: boolean | "cf"
  redirect?: SourceID
}

export interface Column {
  name: string
  sources: SourceID[]
}

export interface NewsItem {
  id: string | number // unique
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: {
    hover?: string
    date?: number | string
    info?: false | string
    diff?: number
    icon?: false | string | {
      url: string
      scale: number
    }
  }
}

export interface SourceResponse {
  status: "success" | "cache"
  id: SourceID
  updatedTime: number | string
  items: NewsItem[]
}
