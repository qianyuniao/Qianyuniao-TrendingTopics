import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { colorOfSource, statsColumnIds } from "@shared/metadata"
import { sources } from "@shared/sources"
import type { NewsItem, SourceResponse } from "@shared/types"
import { PortalLinks } from "~/components/common/portal-links"
import { BoardScrollArea } from "~/components/hotboard/board-scroll-area"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { CardActions } from "~/components/hotboard/card-actions"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import type { SortableCardProps } from "~/components/hotboard/sortable-board"
import { BOARD_CARD_BASE, myFetch } from "~/utils"

export const Route = createFileRoute("/dashboard")({
  component: StatsDashboard,
})

/** 自动刷新间隔（秒） */
const REFRESH_SECONDS = 5 * 60

/** 数据看板的 column 同时也是对应的 source id */
type StatsColumnID = (typeof statsColumnIds)[number]

/**
 * 官方数据平台导航（按领域分组）
 * 其中多数为纯前端渲染站点（海关、卫健委、教育部、人社部、民政部等），
 * 服务端抓取只能拿到空页面，故以链接方式在看板顶部聚合。
 */
const DATA_PORTALS = [
  {
    label: "宏观与综合",
    links: [
      { label: "国家数据", href: "https://data.stats.gov.cn/" },
      { label: "统计年鉴", href: "https://www.stats.gov.cn/sj/ndsj/" },
      { label: "统计公报", href: "https://www.gov.cn/gongbao/" },
      { label: "数据解读", href: "https://www.stats.gov.cn/sj/sjjd/" },
    ],
  },
  {
    label: "金融",
    links: [
      { label: "人民银行统计数据", href: "http://www.pbc.gov.cn/diaochatongjisi/116219/index.html" },
      { label: "金融监管总局", href: "https://www.nfra.gov.cn/" },
      { label: "外汇局国际收支", href: "https://www.safe.gov.cn/safe/tjsj/" },
      { label: "中国货币网", href: "https://www.chinamoney.com.cn/" },
      { label: "中国债券信息网", href: "https://www.chinabond.com.cn/" },
      { label: "人民银行征信中心", href: "https://www.pbccrc.org.cn/" },
    ],
  },
  {
    label: "国际权威统计机构",
    links: [
      { label: "联合国数据", href: "https://data.un.org/" },
      { label: "联合国统计司", href: "https://unstats.un.org/" },
      { label: "世界银行公开数据", href: "https://data.worldbank.org/" },
      { label: "OECD 数据", href: "https://data.oecd.org/" },
      { label: "IMF 数据", href: "https://www.imf.org/en/Data" },
      { label: "欧盟统计局", href: "https://ec.europa.eu/eurostat/" },
      { label: "世贸组织统计", href: "https://www.wto.org/english/res_e/statis_e/statis_e.htm" },
      { label: "国际劳工组织", href: "https://ilostat.ilo.org/" },
      { label: "粮农组织 FAOSTAT", href: "https://www.fao.org/faostat/" },
      { label: "世卫组织 GHO", href: "https://www.who.int/data/gho" },
      { label: "联合国贸发会议", href: "https://unctad.org/" },
      { label: "国际能源署", href: "https://www.iea.org/data-and-statistics" },
      { label: "世界人口展望", href: "https://population.un.org/wpp/" },
      { label: "欧洲央行", href: "https://www.ecb.europa.eu/press/html/index.en.html" },
      { label: "美联储 FRED", href: "https://fred.stlouisfed.org/" },
      { label: "美国经济分析局", href: "https://www.bea.gov/" },
      { label: "日本统计局", href: "https://www.stat.go.jp/" },
      { label: "CIA 世界概况", href: "https://www.cia.gov/the-world-factbook/" },
    ],
  },
  {
    label: "行业与民生",
    links: [
      { label: "中国气象数据网", href: "https://data.cma.cn/" },
      { label: "中国政府采购网", href: "https://www.ccgp.gov.cn/" },
      { label: "CNNIC 统计报告", href: "https://www.cnnic.net.cn/" },
      { label: "海关总署统计", href: "http://www.customs.gov.cn/" },
      { label: "教育部教育统计", href: "http://www.moe.gov.cn/jyb_sjzl/" },
      { label: "人社部统计公报", href: "http://www.mohrss.gov.cn/" },
      { label: "卫健委卫生统计", href: "http://www.nhc.gov.cn/" },
      { label: "民政事业统计公报", href: "https://www.mca.gov.cn/" },
      { label: "文旅部统计", href: "https://www.mct.gov.cn/" },
    ],
  },
]

function StatsDashboard() {
  return (
    <div className="flex flex-col gap-4 p-2 sm:p-3">
      <BoardToolbar
        color="sky"
        title="统计数据看板"
        badge={`官方数据平台 · ${statsColumnIds.length} 个数据栏目`}
        hint="国家统计局权威数据 + 央行 / 财政等官方统计发布"
      >
        <PortalLinks
          groups={DATA_PORTALS}
          from="#06b6d4"
          to="#8b5cf6"
        />
      </BoardToolbar>

      <SortableBoard
        storageKey="stats-dashboard"
        ids={statsColumnIds}
        className="grid gap-4 sm:(grid-cols-2) lg:(grid-cols-3)"
        renderCard={(id, sortable) => <StatsCard key={id} id={id as StatsColumnID} sortable={sortable} />}
      />
    </div>
  )
}

function StatsCard({ id, sortable }: { id: StatsColumnID, sortable?: SortableCardProps }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["stats", id],
    queryFn: () => myFetch<SourceResponse>(`/api/s?id=${id}`),
    enabled: inView,
    refetchInterval: REFRESH_SECONDS * 1000,
    staleTime: 0,
    // 政府站点偶发超时/限流，失败后自动再试一次，减少「获取失败」
    retry: 1,
  })

  const name = sources[id]?.name ?? id
  const home = sources[id]?.home ?? "#"
  const color = colorOfSource(id)
  const items = data?.items ?? []
  const { isFocused, toggleFocus } = useFocusWith(id)
  const status = isError
    ? "获取失败"
    : isFetching && !data
      ? "加载中..."
      : data
        ? `${data.items.length} 条`
        : "加载中..."

  // 同一节点既做视口懒加载的观察目标，也做拖拽落点
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
            <StatsItem key={`${item.id ?? index}-${index}`} item={item} index={index} color={color} />
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
        <a
          href={home}
          target="_blank"
          rel="noopener noreferrer"
          className={$("self-start text-xs op-80 hover:(op-100 underline) transition-all")}
        >
          {`前往官网查看全部（共 ${data.items.length} 条）`}
        </a>
      )}
    </div>
  )
}

function StatsItem({ item, index, color }: { item: NewsItem, index: number, color: string }) {
  const date = item.pubDate ? String(item.pubDate) : ""
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
      {!!date && (
        <span className="shrink-0 text-xs op-50 font-mono tabular-nums">{date}</span>
      )}
    </li>
  )
}
