import { Link } from "@tanstack/react-router"
import { useInView } from "framer-motion"
import type { HotboardPlatform } from "@shared/hotboard"
import { categoryOf, platformColor } from "@shared/hotboard"
import type { SourceID } from "@shared/types"
import { BoardRow } from "./board-row"
import { BoardScrollArea } from "./board-scroll-area"
import { CardActions } from "./card-actions"
import { PlatformIcon } from "./platform-icon"
import type { SortableCardProps } from "./sortable-board"
import { BOARD_CARD_BASE } from "~/utils"

/**
 * 单个平台的热榜卡片：进入视口才拉取数据，支持关键词过滤与手动刷新
 * 广场与短视频看板共用，差异由 `showCover` / `showMeta` / `rowVariant` 控制
 */
export function PlatformCard({
  platform,
  keyword,
  refreshKey,
  showCover = false,
  showMeta = false,
  showType = false,
  rowVariant = "dense",
  sortable,
}: {
  platform: HotboardPlatform
  keyword: string
  refreshKey: number
  showCover?: boolean
  showMeta?: boolean
  showType?: boolean
  rowVariant?: "dense" | "normal"
  /** 由 SortableBoard 注入，用于拖拽排序 */
  sortable?: SortableCardProps
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const { data, isFetching, isError, error, refetch } = useHotboardData(platform.id, refreshKey, inView)

  const kw = keyword.trim().toLowerCase()
  const items = (data?.items ?? []).filter((item) => {
    if (!kw) return true
    return (item.title ?? "").toLowerCase().includes(kw) || (item.desc ?? "").toLowerCase().includes(kw)
  })
  const relativeTime = useRelativeTime(data?.updatedTime ?? "")
  const color = platformColor(platform.id)
  const { isFocused, toggleFocus } = useFocusWith(platform.id as SourceID)

  // 同一节点既做视口懒加载的观察目标，也做拖拽落点
  // 用 ref 持有最新的 setNodeRef，保证 bindRef 引用稳定，避免每次渲染都重新挂载节点
  const setNodeRefRef = useRef(sortable?.setNodeRef)
  setNodeRefRef.current = sortable?.setNodeRef
  const bindRef = useCallback((el: HTMLDivElement | null) => {
    ref.current = el
    setNodeRefRef.current?.(el)
  }, [])

  const status = isError
    ? "获取失败"
    : isFetching && !data
      ? "加载中..."
      : kw
        ? `匹配 ${items.length} 条`
        : data?.total
          ? `${showType && data.type ? `${data.type} · ` : ""}${data.total} 条${relativeTime ? ` · ${relativeTime}更新` : ""}`
          : "上游返回空"

  return (
    <div
      ref={bindRef}
      className={$(
        BOARD_CARD_BASE,
        "h-500px",
        "gap-3",
        `gp-${color}`,
        sortable?.isDragging && "op-50",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <PlatformIcon id={platform.id} name={platform.name} />
        <span className="flex flex-col min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-xl font-bold truncate" title={platform.name}>{platform.name}</span>
            <span className={$(
              "text-xs px-1.5 py-0.5 rounded-full bg-base bg-op-50! op-80 whitespace-nowrap",
              `color-${color}`,
            )}
            >
              {categoryOf(platform.id)}
            </span>
          </span>
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
              key={item.id ?? index}
              item={item}
              index={index}
              color={color}
              variant={rowVariant}
              showCover={showCover}
              showMeta={showMeta}
            />
          ))}
          {!items.length && (
            <li className="text-sm op-60 py-2 px-1">
              {isError
                ? "数据源异常（上游反爬或超时），点右上角重试"
                : data
                  ? (kw ? "没有匹配的条目" : "上游接口暂时没有返回数据")
                  : "加载中..."}
            </li>
          )}
        </ol>
      </BoardScrollArea>

      {!!data?.total && (
        <div className="flex items-center justify-end gap-2">
          <Link
            to="/hotboard/$platform"
            params={{ platform: platform.id }}
            className={$("text-xs op-80 hover:(op-100 underline) transition-all")}
          >
            {`展开全部（共 ${data.total} 条）`}
          </Link>
        </div>
      )}
    </div>
  )
}
