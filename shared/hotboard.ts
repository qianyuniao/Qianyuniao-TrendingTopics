import type { Color } from "./types"

export interface HotboardOption {
  name: string
  default?: string | number | null
  choices?: string[] | null
  help?: string | null
}

export interface HotboardPlatform {
  id: string
  name: string
  desc: string
  options: HotboardOption[]
}

export interface HotboardItem {
  id: string | number | null
  title: string | null
  desc: string | null
  author: string | null
  time: string | null
  hot: string | number | null
  cover: string | null
  url: string | null
  mobile_url: string | null
}

export interface HotboardResponse {
  id: string
  name: string
  type?: string | null
  total: number
  updatedTime: number
  items: HotboardItem[]
}

/**
 * 安全文本：上游字段偶尔会是对象/数组（如爱奇艺 people），
 * 直接渲染会触发「Objects are not valid as a React child」，统一转成字符串
 */
export function asText(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

/**
 * Hotboard 服务只提供平台列表，不提供分类，
 * 这里按平台性质做一份本地分类，用于前端分组展示
 */
export const HOTBOARD_CATEGORIES = {
  综合热报: ["weibo", "zhihu", "baidu", "toutiao", "qqnews", "sina", "sinanews", "thepaper", "netease"],
  科技开发: ["github", "hackernews", "juejin", "csdn", "cto51", "v2ex", "linuxdo", "nodeseek", "hellogithub", "hostloc", "ithome", "geekpark", "ifanr", "dgtle", "pojie52"],
  财经资讯: ["kr36", "huxiu"],
  新闻资讯: ["nytimes", "todayinhistory", "weatheralarm", "earthquake"],
  影视娱乐: ["bilibili", "douyin", "kuaishou", "acfun", "iqiyi", "haokan", "xiaohongshu", "channels", "tencent", "pptv", "huya", "douyu"],
  游戏社区: ["ngabbs", "lol", "miyoushe", "gameres", "yystv"],
  社交阅读: ["douban", "tieba", "jianshu", "guokr", "newsmth", "weread", "sspai"],
  体育社区: ["hupu"],
} satisfies Record<string, string[]>

/**
 * 视频平台集合：用于「视频」聚合看板
 * 覆盖短视频（抖音 / 快手 / B 站 / AcFun / 小红书）、
 * 长视频（爱奇艺 / 好看视频 / PP视频）与游戏直播（虎牙 / 斗鱼）
 */
export const VIDEO_PLATFORM_IDS = [
  "douyin",
  "kuaishou",
  "bilibili",
  "acfun",
  "xiaohongshu",
  "channels",
  "tencent",
  "iqiyi",
  "haokan",
  "pptv",
  "huya",
  "douyu",
] as const

const VIDEO_PLATFORM_SET: ReadonlySet<string> = new Set(VIDEO_PLATFORM_IDS)

export function isVideoPlatform(id: string) {
  return VIDEO_PLATFORM_SET.has(id)
}

/**
 * 视频平台官网地址
 * 平台列表接口（/api/hotboard）只返回 id / name / desc / options，不含官网；
 * 且 acfun / haokan / xiaohongshu 等没有对应的 sources 定义，故在此单独维护。
 */
export const VIDEO_PLATFORM_HOMES: Record<string, string> = {
  douyin: "https://www.douyin.com",
  kuaishou: "https://www.kuaishou.com",
  bilibili: "https://www.bilibili.com",
  acfun: "https://www.acfun.cn",
  iqiyi: "https://www.iqiyi.com",
  haokan: "https://www.haokan.baidu.com",
  xiaohongshu: "https://www.xiaohongshu.com",
  channels: "https://channels.weixin.qq.com",
  tencent: "https://v.qq.com",
  pptv: "https://www.pptv.com",
  huya: "https://www.huya.com",
  douyu: "https://www.douyu.com",
}

export const ALL_CATEGORY = "全部"
export const OTHER_CATEGORY = "其他"

const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(HOTBOARD_CATEGORIES).flatMap(([name, ids]) => ids.map(id => [id, name])),
)

export const HOTBOARD_CATEGORY_ORDER = [
  ...Object.keys(HOTBOARD_CATEGORIES),
  OTHER_CATEGORY,
]

export function categoryOf(id: string) {
  return CATEGORY_MAP[id] ?? OTHER_CATEGORY
}

/**
 * 分类配色：与看板卡片（src/components/column/card.tsx）保持同一套视觉语言
 */
export const HOTBOARD_CATEGORY_COLORS: Record<string, Color> = {
  [ALL_CATEGORY]: "primary",
  综合热报: "red",
  科技开发: "blue",
  财经资讯: "amber",
  新闻资讯: "indigo",
  影视娱乐: "purple",
  游戏社区: "emerald",
  社交阅读: "teal",
  体育社区: "orange",
  [OTHER_CATEGORY]: "gray",
}

export function categoryColor(category: string): Color {
  return HOTBOARD_CATEGORY_COLORS[category] ?? "primary"
}

export function platformColor(id: string): Color {
  return categoryColor(categoryOf(id))
}
