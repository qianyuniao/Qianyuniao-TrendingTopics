/** 刷新按钮：请求中转为旋转图标 */
export function RefreshButton({
  color,
  busy = false,
  title = "刷新",
  className,
  onClick,
}: {
  color: string
  busy?: boolean
  title?: string
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={$(
        "btn text-lg",
        `color-${color}`,
        busy ? "animate-spin i-ph:circle-dashed-duotone" : "i-ph:arrow-counter-clockwise-duotone",
        className,
      )}
    />
  )
}
