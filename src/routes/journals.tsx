import { Link, createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { colorOfSource, journalColumnIds, metadata } from "@shared/metadata"
import type { NewsItem, SourceResponse } from "@shared/types"
import { PortalLinks, portalGroupsOf } from "~/components/common/portal-links"
import { BoardScrollArea } from "~/components/hotboard/board-scroll-area"
import { CardActions } from "~/components/hotboard/card-actions"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import type { SortableCardProps } from "~/components/hotboard/sortable-board"
import { BOARD_CARD_BASE } from "~/utils"

export const Route = createFileRoute("/journals")({
  component: JournalsBoard,
})

/** 自动刷新间隔（秒） */
const REFRESH_SECONDS = 5 * 60

/** 顶刊广场的 column 同时也是对应的 source id */
type JournalColumnID = (typeof journalColumnIds)[number]

function JournalsBoard() {
  return (
    <div className="flex flex-col gap-4 p-2 sm:p-3">
      <div className={$(
        "flex flex-col gap-3 rounded-2xl p-4 transition-all",
        "bg-base bg-op-85!",
        "panel-outline meteor-ring",
        "sprinkle-emerald",
      )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">顶刊论文广场</h1>
          <span className={$("text-xs px-1.5 py-0.5 rounded-full bg-neutral-400/10 whitespace-nowrap", "color-emerald")}>
            {`共 ${journalColumnIds.length} 个顶级期刊`}
          </span>
          <span className="text-xs op-70">全球顶级期刊 / 预印本最新论文，4 个一排并排浏览</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <PortalLinks
            groups={portalGroupsOf("期刊官网", journalColumnIds)}
            from="#10b981"
            to="#0ea5e9"
          />
        </div>
      </div>

      <SortableBoard
        storageKey="journals"
        ids={journalColumnIds}
        className="grid gap-4 sm:(grid-cols-2) lg:(grid-cols-3) xl:(grid-cols-4)"
        renderCard={(id, sortable) => <JournalCard key={id} id={id as JournalColumnID} sortable={sortable} />}
      />
    </div>
  )
}

function JournalCard({ id, sortable }: { id: JournalColumnID, sortable?: SortableCardProps }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["journal", id],
    queryFn: () => myFetch<SourceResponse>(`/api/s?id=${id}`),
    enabled: inView,
    refetchInterval: REFRESH_SECONDS * 1000,
    staleTime: 0,
    // 期刊上游（尤其 nature.com）偶发超时/限流，失败后自动再试一次，减少“获取失败”
    retry: 1,
  })

  const name = metadata[id]?.name ?? id
  const color = colorOfSource(id)
  const items = data?.items ?? []
  const { isFocused, toggleFocus } = useFocusWith(id)
  const status = isError
    ? "获取失败"
    : isFetching && !data
      ? "加载中..."
      : data
        ? `${data.items.length} 篇`
        : "加载中..."

  // 同一节点既做视口懒加载的观察目标，也做拖拽落点
  // 用 ref 持有最新的 setNodeRef，保证 bindRef 引用稳定，避免每次渲染都重新挂载节点
  const setNodeRefRef = useRef(sortable?.setNodeRef)
  setNodeRefRef.current = sortable?.setNodeRef
  const bindRef = useCallback((el: HTMLDivElement | null) => {
    ref.current = el
    setNodeRefRef.current?.(el)
  }, [])

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
            <JournalItem key={`${item.id ?? index}-${index}`} item={item} index={index} color={color} />
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

      {!!data?.items.length && (
        <Link
          to="/c/$column"
          params={{ column: id }}
          className={$("self-start text-xs op-80 hover:(op-100 underline) transition-all")}
        >
          {`展开全部（共 ${data.items.length} 篇）`}
        </Link>
      )}
    </div>
  )
}

function JournalItem({ item, index, color }: { item: NewsItem, index: number, color: string }) {
  return (
    <li className={$("flex gap-2 items-center rounded-md px-1 py-0.5", "hover:(bg-neutral-400/10) transition-all")}>
      <span className={$(
        "bg-neutral-400/10 min-w-6 flex justify-center items-center rounded-md text-xs font-mono",
        index < 3 && `color-${color} font-bold`,
      )}
      >
        {index + 1}
      </span>
      <a
        href={item.url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        title={item.title ?? undefined}
        className={$(
          "block min-w-0 flex-1 truncate text-sm",
          "hover:(underline) visited:(text-neutral-400) transition-all",
        )}
      >
        {item.title ?? "-"}
      </a>
    </li>
  )
}
