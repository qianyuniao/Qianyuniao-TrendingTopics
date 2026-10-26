/**
 * 顶刊论文广场：全球顶级期刊与预印本的最新论文
 */
import { createFileRoute } from "@tanstack/react-router"
import { journalColumnIds } from "@shared/metadata"
import type { FixedColumnID, SourceID } from "@shared/types"
import { PortalLinks } from "~/components/common/portal-links"
import { portalGroupsOf } from "~/components/common/portal-groups"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { SourceCard } from "~/components/hotboard/source-card"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { BOARD_GRID_CLASS, BOARD_PAGE_CLASS } from "~/utils"

export const Route = createFileRoute("/journals")({
  component: JournalsBoard,
})

/** 顶刊广场的 column 同时也是对应的 source id */
type JournalColumnID = (typeof journalColumnIds)[number]

function JournalsBoard() {
  return (
    <div className={BOARD_PAGE_CLASS}>
      <BoardToolbar
        color="emerald"
        title="顶刊论文广场"
        badge={`共 ${journalColumnIds.length} 个顶级期刊`}
        hint="全球顶级期刊 / 预印本最新论文，4 个一排并排浏览"
      >
        <PortalLinks
          groups={portalGroupsOf("期刊官网", journalColumnIds)}
          from="#10b981"
          to="#0ea5e9"
        />
      </BoardToolbar>

      <SortableBoard
        storageKey="journals"
        ids={journalColumnIds}
        className={BOARD_GRID_CLASS}
        renderCard={(id, sortable) => (
          <SourceCard
            key={id}
            id={id as SourceID}
            column={id as JournalColumnID as FixedColumnID}
            unit="篇"
            sortable={sortable}
          />
        )}
      />
    </div>
  )
}
