import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { colorOfSource, metadata } from "@shared/metadata"
import { sources } from "@shared/sources"
import type { ColumnID, FixedColumnID, SourceID, SourceResponse } from "@shared/types"
import { BoardRow } from "./board-row"
import { BoardScrollArea } from "./board-scroll-area"
import { CardActions } from "./card-actions"
import { PlatformIcon } from "./platform-icon"
import { newsRow } from "./row-data"
import type { SortableCardProps } from "./sortable-board"
import { boardCardClass } from "~/utils"

/** 自动刷新间隔（秒） */
const REFRESH_SECONDS = 5 * 60

/**
 * 信息流源卡片：顶刊论文、国家政策、统计数据等走 `/api/s` 的源共用这一份实现
 * 之前各广场各自维护一份近乎相同的卡片（JournalCard / PolicyCard / StatsCard），
 * 差异仅在量词、底部链接与是否显示日期，现统一由 props 控制。
 */
export function SourceCard({
  id,
  sortable,
  unit = "条",
  link = "column",
  column,
  showDate = false,
  refreshKey = 0,
}: {
  id: SourceID
  /** 由 SortableBoard 注入，用于拖拽排序 */
  sortable?: SortableCardProps
  /** 条目量词，如「篇」「条」 */
  unit?: string
  /** 底部「展开全部」的目标：专栏详情页或源官网 */
  link?: "column" | "home"
  /** `link="column"` 时的路由参数，默认取 id（顶刊等 column 与 source 同 id） */
  column?: FixedColumnID
  /** 显示右侧日期列，统计数据看板用 */
  showDate?: boolean
  /** 变化时重新拉取数据，用于收藏页的整页刷新 */
  refreshKey?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["source-card", id, refreshKey],
    queryFn: () => myFetch<SourceResponse>(`/api/s?id=${id}`),
    enabled: inView,
    refetchInterval: REFRESH_SECONDS * 1000,
    staleTime: 0,
    // 期刊 / 政府站点偶发超时或限流，失败后自动再试一次，减少「获取失败」
    retry: 1,
  })

  // 顶刊等栏目的 column 与 source 同 id，优先取栏目中文名
  const name = metadata[id as unknown as ColumnID]?.name ?? sources[id]?.name ?? id
  const home = sources[id]?.home ?? "#"
  const color = colorOfSource(id)
  const items = data?.items ?? []
  const { isFocused, toggleFocus } = useFocusWith(id)

  const status = isError
    ? "获取失败"
    : isFetching && !data
      ? "加载中..."
      : data
        ? `${items.length} ${unit}`
        : "加载中..."

  // 同一节点既做视口懒加载的观察目标，也做拖拽落点
  // 用 ref 持有最新的 setNodeRef，保证 bindRef 引用稳定，避免每次渲染都重新挂载节点
  const setNodeRefRef = useRef(sortable?.setNodeRef)
  setNodeRefRef.current = sortable?.setNodeRef
  const bindRef = useCallback((el: HTMLDivElement | null) => {
    ref.current = el
    setNodeRefRef.current?.(el)
  }, [])

  const footerClass = "self-start text-xs op-80 hover:(op-100 underline) transition-all"
  let footer: ReactNode = null
  if (items.length && link === "home") {
    footer = (
      <a href={home} target="_blank" rel="noopener noreferrer" className={footerClass}>
        {`前往官网查看全部（共 ${items.length} ${unit}）`}
      </a>
    )
  } else if (items.length) {
    footer = (
      <Link
        to="/c/$column"
        params={{ column: column ?? (id as unknown as FixedColumnID) }}
        className={footerClass}
      >
        {`展开全部（共 ${items.length} ${unit}）`}
      </Link>
    )
  }

  return (
    <div
      ref={bindRef}
      className={boardCardClass(color, sortable?.isDragging)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <PlatformIcon
          id={id}
          name={name}
          className="w-9 h-9"
          href={home === "#" ? undefined : home}
          title={home === "#" ? undefined : `前往 ${name} 官网`}
        />
        <span className="flex flex-col min-w-0">
          <span className="text-xl font-bold truncate" title={name}>{name}</span>
          <span className="text-xs op-70 truncate">{status}</span>
        </span>
        <div className="ml-auto">
          <CardActions
            color={color}
            busy={isFetching}
            refreshTitle={isError ? `重试（${String(error?.message ?? "数据源异常")}）` : "刷新"}
            onRefresh={() => refetch()}
            focused={isFocused}
            onToggleFocus={toggleFocus}
            setHandleRef={sortable?.setHandleRef}
          />
        </div>
      </div>

      <BoardScrollArea color={color} busy={isFetching}>
        <ol className="flex flex-col gap-1">
          {items.map((item, index) => (
            <BoardRow
              key={item.id ?? `${item.title ?? ""}|${item.url ?? ""}`}
              row={newsRow(item)}
              index={index}
              color={color}
              variant="dense"
              showDate={showDate}
            />
          ))}
          {!items.length && (
            <li className="text-sm op-60 py-2 px-1">
              {isError
                ? "数据源异常（上游反爬或超时），点右上角重试"
                : data
                  ? "上游接口暂时没有返回数据"
                  : "加载中..."}
            </li>
          )}
        </ol>
      </BoardScrollArea>

      {footer}
    </div>
  )
}
