// @unocss-include
/**
 * 前端通用工具集（目录已被 unimport 扫描，可直接使用无需 import）
 *
 * 注意：UnoCSS 默认只扫描 .tsx/.jsx/.vue/.html 等文件，
 * 本文件里定义的看板类名常量（网格、卡片尺寸）必须靠上面的
 * `@unocss-include` 标记才会被提取成 CSS，否则响应式断点类名
 * （sm:/lg:/xl:）会整体丢失，导致网格退化成单列。
 */
import type { MaybePromise } from "@shared/type.util"
import { $fetch } from "ofetch"

/** JSON.parse 的安全版本：解析失败时返回空字符串而非抛异常 */
export function safeParseString(str: any) {
  try {
    return JSON.parse(str)
  } catch {
    return ""
  }
}

/**
 * 可暂停 / 恢复 / 清除的定时器
 * 用于自动刷新：页面隐藏或用户操作时暂停，恢复后继续剩余时长
 */
export class Timer {
  private timerId?: any
  private start!: number
  private remaining: number
  private callback: () => MaybePromise<void>

  constructor(callback: () => MaybePromise<void>, delay: number) {
    this.callback = callback
    this.remaining = delay
    this.resume()
  }

  /** 暂停计时，保存剩余毫秒数 */
  pause() {
    clearTimeout(this.timerId)
    this.remaining -= Date.now() - this.start
  }

  /** 从剩余时长继续计时 */
  resume() {
    this.start = Date.now()
    clearTimeout(this.timerId)
    this.timerId = setTimeout(this.callback, this.remaining)
  }

  /** 取消计时 */
  clear() {
    clearTimeout(this.timerId)
  }
}

/** 指向服务端 `/api` 的请求实例：统一 15 秒超时、失败不自动重试 */
export const myFetch = $fetch.create({
  timeout: 15000,
  retry: 0,
  baseURL: "/api",
  // 服务端接口只返回 JSON；若 Pages 未挂载服务端函数会返回 HTML 404，
  // 这里强制按 JSON 解析，解析失败即抛错进入查询的 error 分支（显示空看板），
  // 避免把 HTML 字符串当数组调用 .filter 导致整页 "Something went wrong!" 崩溃。
  responseType: "json",
  // 非 2xx（含 404/405 HTML）直接抛错，走 isError 兜底 UI
  async onResponse({ response }) {
    if (response.status >= 400) {
      throw new Error(`服务端接口返回 ${response.status}`)
    }
  },
})

/**
 * 生产环境取数：优先走服务端实时接口，失败（服务端未挂载 / 超时 / 非 JSON）时
 * 自动回落到构建期静态快照，保证看板永远有数据而不是空白。
 * 开发环境直接走实时接口。
 */
export async function fetchLiveOrSnapshot<T>(livePath: string, snapshotPath: string, options?: Record<string, any>): Promise<T> {
  if (!import.meta.env.PROD) return myFetch<T>(livePath, options)
  try {
    return await myFetch<T>(livePath, options)
  } catch {
    return myFetch<T>(snapshotPath)
  }
}

/**
 * 生产环境取数：先用构建期静态快照秒开，同时后台请求服务端实时数据，
 * 拿到后通过 onLive 回调替换缓存 —— 既保证首屏不空白，也能自动实时更新。
 * 开发环境直接走实时接口。
 */
export async function fetchSnapshotThenLive<T>(
  snapshotPath: string,
  livePath: string,
  onLive?: (data: T) => void,
  options?: Record<string, any>,
): Promise<T> {
  if (!import.meta.env.PROD) return myFetch<T>(livePath, options)
  const snapshot = await myFetch<T>(snapshotPath).catch(() => undefined)
  const live = myFetch<T>(livePath, options)
    .then((d) => {
      if (d) onLive?.(d)
      return d
    })
    .catch(() => undefined)
  if (snapshot) return snapshot
  const d = await live
  if (!d) throw new Error("数据获取失败")
  return d
}

/**
 * 看板卡片统一外壳样式
 * 所有看板卡片（热榜广场 / 短视频 / 顶刊论文广场 / 最热·实时专栏 / 平台详情头部）
 * 共用同一套外壳：立体轮廓（panel-outline）+ 流星拖尾（meteor-ring）+ 基础结构。
 * 改看板样式只需改这一处，避免各卡片重复书写且相互遗漏。
 */
export const BOARD_CARD_BASE
  = "panel-outline meteor-ring flex flex-col rounded-2xl p-4 cursor-default transition-all"

/** 看板页面统一容器：各广场 / 专栏共用，保证页面留白与区块间距一致 */
export const BOARD_PAGE_CLASS = "flex flex-col gap-4 p-2 sm:p-3"

/**
 * 看板网格统一布局：以顶刊广场为准，响应式 1 / 2 / 3 / 4 列，间距 16px
 * 新增看板直接复用，避免各页列数不一致导致卡片尺寸参差
 */
export const BOARD_GRID_CLASS = "grid gap-4 sm:(grid-cols-2) lg:(grid-cols-3) xl:(grid-cols-4)"

/**
 * 看板卡片统一尺寸：定高 500px + 主题渐变底，与顶刊广场卡片一致
 * 卡片宽度由网格列数决定，不再由各页单独指定
 */
export function boardCardClass(color: string, dragging = false) {
  return [
    BOARD_CARD_BASE,
    "h-500px",
    "gap-3",
    `gp-${color}`,
    dragging && "op-50",
  ].filter(Boolean).join(" ")
}

/** 看板提示条（错误 / 空结果）统一外观，避免各页重复书写 */
export function boardNoticeClass(center = false) {
  return [
    "rounded-2xl bg-base bg-op-85! text-sm",
    center ? "p-6 op-70 text-center" : "p-4 sprinkle-primary",
  ].join(" ")
}

/** 是否为 iOS / iPadOS 设备（用于规避移动端 Safari 的滚动与手势差异） */
export function isiOS() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod",
  ].includes(navigator.platform)
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
