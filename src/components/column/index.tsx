import type { FixedColumnID } from "@shared/types"
import { useTitle } from "react-use"
import { Dnd } from "./dnd"
import { NavBar } from "~/components/layout/navbar"
import { PortalLinks, portalGroupsOf } from "~/components/common/portal-links"
import { currentColumnIDAtom } from "~/atoms"

/** 需要在页头展示官网导航的栏目及其渐变色 */
const COLUMN_PORTALS: Partial<Record<FixedColumnID, { from: string, to: string, desc: string }>> = {
  hottest: { from: "#fb923c", to: "#f43f5e", desc: "全网实时热榜聚合，跨平台同步更新" },
  realtime: { from: "#34d399", to: "#22d3ee", desc: "实时更新的资讯与财经快讯流" },
}

export function Column({ id }: { id: FixedColumnID }) {
  const [currentColumnID, setCurrentColumnID] = useAtom(currentColumnIDAtom)
  useEffect(() => {
    setCurrentColumnID(id)
  }, [id, setCurrentColumnID])

  useTitle(`TrendingTopics | ${metadata[id].name}`)

  const portal = COLUMN_PORTALS[id]
  const column = metadata[id]

  return (
    <>
      <div className="flex justify-center md:hidden mb-6">
        <NavBar />
      </div>
      {portal && (
        <div className={$(
          "flex flex-col gap-3 rounded-2xl p-4 mx-2 sm:mx-3 mb-4 transition-all",
          "bg-base bg-op-85!",
          "panel-outline meteor-ring",
        )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{column.name}</h1>
            <span className={$("text-xs px-1.5 py-0.5 rounded-full bg-neutral-400/10 whitespace-nowrap", "color-primary")}>
              {`${column.sources.length} 个数据源`}
            </span>
            <span className="text-xs op-70">{portal.desc}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <PortalLinks
              groups={portalGroupsOf("来源官网", column.sources, 30)}
              from={portal.from}
              to={portal.to}
            />
          </div>
        </div>
      )}
      {id === currentColumnID && <Dnd />}
    </>
  )
}
