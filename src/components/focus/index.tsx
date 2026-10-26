import { journalSet, metadata } from "@shared/metadata"
import { sources } from "@shared/sources"
import type { ColumnID, SourceID } from "@shared/types"
import { focusSourcesAtom } from "~/atoms"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { PlatformCard } from "~/components/hotboard/platform-card"
import { SourceCard } from "~/components/hotboard/source-card"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { HOTBOARD_REFRESH_SECONDS, useHotboardPlatforms } from "~/hooks/useHotboard"
import { BOARD_GRID_CLASS, BOARD_PAGE_CLASS, boardNoticeClass } from "~/utils"

/**
 * 收藏看板：集中展示所有加了星标的数据源
 * 热榜平台沿用热榜卡片（热度 / 封面等字段更丰富），其余源沿用信息流卡片，
 * 两种卡片共用同一套尺寸与网格，页面结构与各广场一致。
 */
export function FocusBoard() {
  const focusSources = useAtomValue(focusSourcesAtom)
  const [keyword, setKeyword] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const { left, reset } = useCountdown(HOTBOARD_REFRESH_SECONDS)
  const { data: platforms } = useHotboardPlatforms()

  const platformMap = useMemo(() => new Map((platforms ?? []).map(item => [item.id, item])), [platforms])

  /** 统一取源名称：优先热榜平台名，其次栏目名，最后源表名 */
  const nameOf = useCallback((id: SourceID) => {
    return platformMap.get(id)?.name
      ?? metadata[id as unknown as ColumnID]?.name
      ?? sources[id]?.name
      ?? id
  }, [platformMap])

  const list = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return focusSources
    return focusSources.filter(id => nameOf(id).toLowerCase().includes(kw) || id.includes(kw))
  }, [focusSources, keyword, nameOf])

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
    reset()
  }, [reset])

  return (
    <div className={BOARD_PAGE_CLASS}>
      <BoardToolbar
        color="primary"
        title="我的收藏"
        titleIcon="i-ph:star-duotone text-3xl"
        badge={`${focusSources.length} 个数据源`}
        hint="点击卡片右上角的星标可取消收藏，登录后可跨设备同步"
        search={{ value: keyword, onChange: setKeyword, placeholder: "搜索收藏的数据源" }}
        onRefresh={refresh}
        countdown={left}
      />

      <SortableBoard
        storageKey="focus"
        ids={list}
        className={BOARD_GRID_CLASS}
        renderCard={(id, sortable) => {
          const platform = platformMap.get(id)
          if (platform) {
            return (
              <PlatformCard
                key={id}
                platform={platform}
                keyword={keyword}
                refreshKey={refreshKey}
                sortable={sortable}
              />
            )
          }
          return (
            <SourceCard
              key={id}
              id={id as SourceID}
              link="home"
              unit={journalSet.has(id) ? "篇" : "条"}
              refreshKey={refreshKey}
              sortable={sortable}
            />
          )
        }}
      />

      {!list.length && (
        <div className={boardNoticeClass(true)}>
          {focusSources.length
            ? "没有匹配的收藏，换个关键词试试"
            : "还没有收藏任何数据源：去任意广场点击卡片右上角的星标，即可把它加入这里"}
        </div>
      )}
    </div>
  )
}
