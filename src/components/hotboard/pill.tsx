import type { ReactNode } from "react"

/** 分类 / 平台切换胶囊：选中态按分类配色高亮 */
export function Pill({
  label,
  count,
  icon,
  active,
  color,
  onClick,
}: {
  label: string
  count?: number
  icon?: ReactNode
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={$(
        "flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer transition-all",
        active
          ? `bg-${color}-500/25 border-${color}-500/40 border color-${color} font-bold`
          : "op-70 hover:(bg-neutral-400/10 op-100)",
      )}
    >
      {icon}
      {label}
      {count != null && (
        <span className={$("text-xs font-mono op-70", active && "op-90")}>{count}</span>
      )}
    </button>
  )
}
