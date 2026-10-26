import type { FixedColumnID } from "@shared/types"
import { useTitle } from "react-use"
import { Dnd } from "./dnd"
import { NavBar } from "~/components/layout/navbar"
import { PortalLinks } from "~/components/common/portal-links"
import { portalGroupsOf } from "~/components/common/portal-groups"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { currentColumnIDAtom } from "~/atoms"

/** 需要在页头展示官网导航的栏目及其主题色（与各广场页头保持一致） */
const COLUMN_PORTALS: Partial<Record<FixedColumnID, { from: string, to: string, desc: string, color: string }>> = {
  hottest: { from: "#fb923c", to: "#f43f5e", desc: "全网实时热榜聚合，跨平台同步更新", color: "orange" },
  realtime: { from: "#34d399", to: "#22d3ee", desc: "实时更新的资讯与财经快讯流", color: "emerald" },
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
        <BoardToolbar
          className="mx-2 sm:mx-3 mb-4"
          color={portal.color}
          title={column.name}
          badge={`${column.sources.length} 个数据源`}
          hint={portal.desc}
        >
          <PortalLinks
            groups={portalGroupsOf("来源官网", column.sources, 30)}
            from={portal.from}
            to={portal.to}
          />
        </BoardToolbar>
      )}
      {id === currentColumnID && <Dnd />}
    </>
  )
}
