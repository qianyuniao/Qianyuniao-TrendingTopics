/**
 * 统计数据看板：各部委统计数据源与官方数据平台入口
 */
import { createFileRoute } from "@tanstack/react-router"
import { statsColumnIds } from "@shared/metadata"
import type { SourceID } from "@shared/types"
import { PortalLinks } from "~/components/common/portal-links"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { SourceCard } from "~/components/hotboard/source-card"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { BOARD_GRID_CLASS, BOARD_PAGE_CLASS } from "~/utils"

export const Route = createFileRoute("/dashboard")({
  component: StatsDashboard,
})

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
    <div className={BOARD_PAGE_CLASS}>
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
        className={BOARD_GRID_CLASS}
        renderCard={(id, sortable) => (
          <SourceCard
            key={id}
            id={id as StatsColumnID as SourceID}
            link="home"
            unit="条"
            showDate
            sortable={sortable}
          />
        )}
      />
    </div>
  )
}
