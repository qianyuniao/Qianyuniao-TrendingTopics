import type { PropsWithChildren } from "react"
import { OverlayScrollbar } from "~/components/common/overlay-scrollbar"

/**
 * 看板卡片内的可滚动列表容器
 * 与「最热 · 实时」专栏一致：overlay 滚动条 + 半透明底 + 加载脉冲
 * 需要父级卡片是定高 flex 列布局（`h-500px` + `flex flex-col`）才能撑出高度
 */
export function BoardScrollArea({
  color,
  busy = false,
  children,
}: PropsWithChildren<{
  color: string
  busy?: boolean
}>) {
  return (
    <OverlayScrollbar
      className={$(
        "min-h-0 flex-1 rounded-2xl bg-base bg-op-70! p-2",
        busy && "animate-pulse",
        `sprinkle-${color}`,
      )}
      options={{ overflow: { x: "hidden" } }}
      defer
    >
      <div className={$("transition-opacity-300", busy && "op-20")}>
        {children}
      </div>
    </OverlayScrollbar>
  )
}
