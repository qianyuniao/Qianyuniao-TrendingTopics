import type { HotboardItem } from "@shared/hotboard"
import { asText } from "@shared/hotboard"

/** 行间距：广场网格更紧凑，详情页更宽松 */
const ROW_STYLE = {
  dense: "gap-2 px-1 py-0.5 rounded-md",
  normal: "gap-3 px-1.5 py-1.5 rounded-xl",
  detail: "gap-3 px-2 py-2 rounded-xl",
} as const

/**
 * 热榜条目行：序号 + 标题 + 可选封面 / 描述 / 作者时间 / 热度
 * 广场、短视频、详情页三处共用，差异由 props 控制
 */
export function BoardRow({
  item,
  index,
  color,
  variant = "normal",
  showCover = false,
  showDesc = false,
  showMeta = false,
}: {
  item: HotboardItem
  index: number
  color: string
  variant?: keyof typeof ROW_STYLE
  showCover?: boolean
  showDesc?: boolean
  showMeta?: boolean
}) {
  const title = asText(item.title)
  const desc = asText(item.desc)
  const author = asText(item.author)
  const time = asText(item.time)
  const hot = asText(item.hot)

  return (
    <li className={$(
      "flex items-center hover:(bg-neutral-400/10) transition-all",
      ROW_STYLE[variant],
    )}
    >
      <span className={$(
        "bg-neutral-400/10 min-w-6 h-6 flex justify-center items-center rounded-md text-xs font-mono shrink-0",
        index < 3 && `color-${color} font-bold`,
      )}
      >
        {index + 1}
      </span>

      {showCover && item.cover && (
        <img
          src={item.cover}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-10 w-16 shrink-0 rounded-lg bg-neutral-400/10 object-cover"
        />
      )}

      <span className="flex flex-1 flex-col gap-0.5 min-w-0">
        <a
          href={item.url ?? item.mobile_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          title={title || undefined}
          className={$(
            "block truncate hover:(underline) visited:(text-neutral-400) transition-all",
            variant === "detail" ? "text-base" : "text-sm",
          )}
        >
          {title || "-"}
        </a>
        {showDesc && !!desc && (
          <span className="text-xs op-60 whitespace-pre-wrap line-clamp-2">{desc}</span>
        )}
        {showMeta && !!(author || time) && (
          <span className="flex gap-2 text-xs text-neutral-400/80 truncate">
            {!!author && <span className="truncate">{author}</span>}
            {!!time && <span className="shrink-0">{time}</span>}
          </span>
        )}
      </span>

      {!!hot && (
        <span className="shrink-0 rounded-full bg-neutral-400/10 px-2 py-0.5 text-xs font-mono op-70">
          {hot}
        </span>
      )}
    </li>
  )
}
