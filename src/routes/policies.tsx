/**
 * 国家政策广场：国务院及各部委官网的最新政策
 */
import { createFileRoute } from "@tanstack/react-router"
import { policyColumnIds } from "@shared/metadata"
import type { SourceID } from "@shared/types"
import { PortalLinks } from "~/components/common/portal-links"
import { portalGroupsOf } from "~/components/common/portal-groups"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { SourceCard } from "~/components/hotboard/source-card"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { BOARD_GRID_CLASS, BOARD_PAGE_CLASS } from "~/utils"

export const Route = createFileRoute("/policies")({
  component: PoliciesBoard,
})

/** 政策广场的 column 同时也是对应的 source id */
type PolicyColumnID = (typeof policyColumnIds)[number]

function PoliciesBoard() {
  return (
    <div className={BOARD_PAGE_CLASS}>
      <BoardToolbar
        color="red"
        title="国家政策"
        badge={`共 ${policyColumnIds.length} 个职能部门`}
        hint="汇聚国务院及各部委官网最新政策发布 —— 想更多了解国家政策，就在这里"
      >
        <PortalLinks
          groups={portalGroupsOf("部委官网", policyColumnIds, 30)}
          from="#f59e0b"
          to="#ef4444"
        />
      </BoardToolbar>

      <SortableBoard
        storageKey="policies"
        ids={policyColumnIds}
        className={BOARD_GRID_CLASS}
        renderCard={(id, sortable) => (
          <SourceCard
            key={id}
            id={id as PolicyColumnID as SourceID}
            link="home"
            unit="条"
            sortable={sortable}
          />
        )}
      />
    </div>
  )
}
