/**
 * 看板卡片右上角操作区：刷新 / 收藏 / 移动
 * 与「最热 · 实时」专栏卡片保持一致，所有看板共用
 */
export function CardActions({
  color,
  busy = false,
  refreshTitle = "刷新",
  onRefresh,
  focused,
  onToggleFocus,
  setHandleRef,
}: {
  color: string
  busy?: boolean
  refreshTitle?: string
  onRefresh: () => void
  focused: boolean
  onToggleFocus: () => void
  /** 传入后显示「移动」拖拽手柄（由拖拽排序网格注入） */
  setHandleRef?: (el: HTMLElement | null) => void
}) {
  return (
    <div className={$("flex shrink-0 items-center gap-1 text-lg", `color-${color}`)}>
      <button
        type="button"
        title={refreshTitle}
        onClick={onRefresh}
        className={$("btn", busy ? "animate-spin i-ph:circle-dashed-duotone" : "i-ph:arrow-counter-clockwise-duotone")}
      />
      <button
        type="button"
        title={focused ? "取消收藏" : "收藏（加入关注）"}
        onClick={onToggleFocus}
        className={$("btn", focused ? "i-ph:star-fill" : "i-ph:star-duotone")}
      />
      {/* firefox 无法拖动 button，因此手柄必须是 div */}
      {setHandleRef && (
        <div
          ref={setHandleRef}
          title="按住拖动排序"
          className={$("btn", "i-ph:dots-six-vertical-duotone", "cursor-grab")}
        />
      )}
    </div>
  )
}
