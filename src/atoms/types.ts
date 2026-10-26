/**
 * 全局状态相关的公共类型：atom 更新函数形态与提示条 ToastItem
 */
import type { MaybePromise } from "@shared/type.util"

export type Update<T> = T | ((prev: T) => T)

export interface ToastItem {
  id: number
  type?: "success" | "error" | "warning" | "info"
  msg: string
  duration?: number
  action?: {
    label: string
    onClick: () => MaybePromise<void>
  }
  onDismiss?: () => MaybePromise<void>
}
