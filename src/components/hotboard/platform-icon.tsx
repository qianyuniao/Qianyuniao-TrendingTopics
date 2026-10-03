import { useState } from "react"

/** 热榜平台 id 与本地图标文件名的差异映射 */
const ICON_ALIAS: Record<string, string> = {
  kr36: "36kr",
  cto51: "51cto",
}

/**
 * 平台图标：优先使用 `public/icons/<id>.png`，
 * 没有对应图标时退化为首字母头像，保证卡片样式统一
 */
export function PlatformIcon({
  id,
  name,
  className = "w-8 h-8",
}: {
  id: string
  name?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const file = ICON_ALIAS[id] ?? id
  const label = (name ?? id).trim().slice(0, 1).toUpperCase()

  return (
    <span
      className={$(
        "relative grid place-items-center shrink-0 overflow-hidden rounded-full",
        "bg-neutral-400/10 text-xs font-bold op-80",
        className,
      )}
    >
      <span aria-hidden="true">{label}</span>
      {!failed && (
        <img
          src={`/icons/${file}.png`}
          alt={name ?? id}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}
