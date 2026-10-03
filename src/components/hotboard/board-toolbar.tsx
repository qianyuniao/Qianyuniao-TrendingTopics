import type { ReactNode } from "react"
import { RefreshButton } from "./refresh-button"

/** 热榜页面顶部工具栏：标题 + 徽标 + 搜索 + 刷新 + 自动刷新倒计时 + 筛选行 */
export function BoardToolbar({
  color,
  title,
  titleIcon,
  badge,
  hint,
  search,
  onRefresh,
  countdown,
  children,
}: {
  color: string
  title: string
  titleIcon?: string
  badge?: ReactNode
  hint?: ReactNode
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  onRefresh?: () => void
  countdown?: number
  children?: ReactNode
}) {
  return (
    <div className={$(
      "flex flex-col gap-3 rounded-2xl p-4 transition-all",
      "bg-base bg-op-85!",
      "panel-outline meteor-ring",
      `sprinkle-${color}`,
    )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {titleIcon && <span className={$(titleIcon, `color-${color}`)} />}
          {title}
        </h1>
        {!!badge && (
          <span className={$(
            "text-xs px-1.5 py-0.5 rounded-full bg-neutral-400/10 whitespace-nowrap",
            `color-${color}`,
          )}
          >
            {badge}
          </span>
        )}
        {!!hint && <span className="text-xs op-60 whitespace-nowrap hidden sm:inline">{hint}</span>}
        {search && (
          <input
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "搜索热榜关键词"}
            className={$(
              "ml-auto min-w-40 max-w-80 flex-1 rounded-full px-3 py-1.5 text-sm outline-none",
              "bg-neutral-400/10 placeholder:(op-50) focus:(bg-neutral-400/20)",
            )}
          />
        )}
        {onRefresh && <RefreshButton color={color} onClick={onRefresh} />}
        {countdown != null && (
          <span className="text-xs op-70 font-mono whitespace-nowrap">
            {formatCountdown(countdown)}
            {" "}
            后自动刷新
          </span>
        )}
      </div>

      {!!children && <div className="flex flex-wrap gap-2 text-sm">{children}</div>}
    </div>
  )
}
