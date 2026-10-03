/**
 * 前端通用工具集（目录已被 unimport 扫描，可直接使用无需 import）
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
})

/**
 * 看板卡片统一外壳样式
 * 所有看板卡片（热榜广场 / 短视频 / 顶刊论文广场 / 最热·实时专栏 / 平台详情头部）
 * 共用同一套外壳：立体轮廓（panel-outline）+ 流星拖尾（meteor-ring）+ 基础结构。
 * 改看板样式只需改这一处，避免各卡片重复书写且相互遗漏。
 */
export const BOARD_CARD_BASE =
  "panel-outline meteor-ring flex flex-col rounded-2xl p-4 cursor-default transition-all"

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
