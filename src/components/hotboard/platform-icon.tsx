import { useState } from "react"

/** 热榜平台 id 与本地图标文件名的差异映射 */
const ICON_ALIAS: Record<string, string> = {
  kr36: "36kr",
  cto51: "51cto",
}

/**
 * 图标候选文件名：变体源（如 v2ex-share、bilibili-ranking）通常没有单独图标，
 * 依次回退到去掉末段后缀的主站图标（v2ex、bilibili），都缺失时才用首字母头像
 */
function iconCandidates(id: string): string[] {
  const primary = ICON_ALIAS[id] ?? id
  const list = [primary]
  if (primary.includes("-")) list.push(primary.replace(/-[^-]+$/, ""))
  return list
}

/**
 * 平台图标：优先使用 `public/icons/<id>.png`，
 * 没有对应图标时退化为首字母头像，保证卡片样式统一
 */
export function PlatformIcon({
  id,
  name,
  className = "w-8 h-8",
  href,
  title,
}: {
  id: string
  name?: string
  className?: string
  /** 传入后图标可点击跳转到对应官网 */
  href?: string
  title?: string
}) {
  const [attempt, setAttempt] = useState(0)
  const candidates = iconCandidates(id)
  const file = candidates[attempt]
  const label = (name ?? id).trim().slice(0, 1).toUpperCase()

  const icon = (
    <span
      className={$(
        "relative grid place-items-center shrink-0 overflow-hidden rounded-full",
        "bg-neutral-400/10 text-xs font-bold op-80",
        className,
      )}
    >
      <span aria-hidden="true">{label}</span>
      {file && (
        <img
          key={file}
          src={`/icons/${file}.png`}
          alt={name ?? id}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setAttempt(a => a + 1)}
        />
      )}
    </span>
  )

  if (!href) return icon

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title ?? name ?? id}
    >
      {icon}
    </a>
  )
}
