import { asText } from "@shared/hotboard"
import type { BoardRowData } from "./row-data"

/** 行间距：广场网格更紧凑，详情页更宽松（须留在 .tsx 中，UnoCSS 才会提取这些类名） */
export const ROW_STYLE = {
  dense: "gap-2 px-1 py-0.5 rounded-md",
  normal: "gap-3 px-1.5 py-1.5 rounded-xl",
  detail: "gap-3 px-2 py-2 rounded-xl",
} as const

/** 序号徽标：前三名高亮，所有看板列表共用 */
export function BoardRowIndex({ index, color }: { index: number, color: string }) {
  return (
    <span className={$(
      "bg-neutral-400/10 min-w-6 h-6 flex justify-center items-center rounded-md text-xs font-mono shrink-0",
      index < 3 && `color-${color} font-bold`,
    )}
    >
      {index + 1}
    </span>
  )
}

/**
 * 看板条目行：序号 + 标题 + 可选封面 / 描述 / 作者时间 / 热度 / 日期
 * 广场、短视频、顶刊、政策、数据看板、详情页共用，差异由 props 控制
 */
export function BoardRow({
  row,
  index,
  color,
  variant = "normal",
  showCover = false,
  showDesc = false,
  showMeta = false,
  showDate = false,
  children,
}: {
  row: BoardRowData
  index: number
  color: string
  variant?: keyof typeof ROW_STYLE
  showCover?: boolean
  showDesc?: boolean
  showMeta?: boolean
  /** 显示右侧日期列（如统计数据看板的发布日期） */
  showDate?: boolean
  /** 标题后追加的内容，如热榜排名的涨跌标记、来源图标 */
  children?: React.ReactNode
}) {
  const title = asText(row.title)
  const desc = asText(row.desc)
  const author = asText(row.author)
  const time = asText(row.time)
  const hot = asText(row.hot)
  const date = asText(row.date)

  return (
    <li className={$(
      "flex items-center relative hover:(bg-neutral-400/10) transition-all",
      ROW_STYLE[variant],
    )}
    >
      <BoardRowIndex index={index} color={color} />

      {showCover && !!row.cover && (
        <img
          src={row.cover}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-10 w-16 shrink-0 rounded-lg bg-neutral-400/10 object-cover"
        />
      )}

      <span className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="flex items-center gap-2 min-w-0">
          <a
            href={row.url ?? row.mobileUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            title={asText(row.hover) || title || undefined}
            className={$(
              "block min-w-0 flex-1 truncate hover:(underline) visited:(text-neutral-400) transition-all",
              variant === "detail" ? "text-base" : "text-sm",
            )}
          >
            {title || "-"}
          </a>
          {children}
        </span>
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
      {showDate && !!date && (
        <span className="shrink-0 text-xs op-50 font-mono tabular-nums">{date}</span>
      )}
    </li>
  )
}
