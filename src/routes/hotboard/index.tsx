/**
 * 热榜首页：按分类展示各平台榜单入口
 */
import { createFileRoute } from "@tanstack/react-router"
import { ALL_CATEGORY, HOTBOARD_CATEGORY_ORDER, OTHER_CATEGORY, categoryColor, categoryOf } from "@shared/hotboard"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { Pill } from "~/components/hotboard/pill"
import { PlatformCard } from "~/components/hotboard/platform-card"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { HOTBOARD_REFRESH_SECONDS, useHotboardPlatforms } from "~/hooks/useHotboard"
import { BOARD_GRID_CLASS, BOARD_PAGE_CLASS, boardNoticeClass } from "~/utils"

export const Route = createFileRoute("/hotboard/")({
  component: HotboardBoard,
})

function HotboardBoard() {
  const [category, setCategory] = useState(ALL_CATEGORY)
  const [keyword, setKeyword] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const { left, reset } = useCountdown(HOTBOARD_REFRESH_SECONDS)
  const { data: platforms, isError } = useHotboardPlatforms()

  /** 分类及其下的平台数量 */
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const platform of platforms ?? []) {
      const name = categoryOf(platform.id)
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return [
      { name: ALL_CATEGORY, count: platforms?.length ?? 0 },
      ...HOTBOARD_CATEGORY_ORDER
        .filter(name => name === OTHER_CATEGORY || (counts.get(name) ?? 0) > 0)
        .map(name => ({ name, count: counts.get(name) ?? 0 })),
    ]
  }, [platforms])

  const list = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const result = (platforms ?? []).filter((platform) => {
      if (category !== ALL_CATEGORY && categoryOf(platform.id) !== category) return false
      if (!kw) return true
      return platform.name.toLowerCase().includes(kw) || platform.id.includes(kw)
    })
    return category === ALL_CATEGORY
      ? result.sort((a, b) => HOTBOARD_CATEGORY_ORDER.indexOf(categoryOf(a.id)) - HOTBOARD_CATEGORY_ORDER.indexOf(categoryOf(b.id)))
      : result
  }, [platforms, category, keyword])

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
    reset()
  }, [reset])

  return (
    <div className={BOARD_PAGE_CLASS}>
      <BoardToolbar
        color={categoryColor(category)}
        title="热榜广场"
        badge={platforms ? `共 ${list.length} 个榜单` : "加载中..."}
        search={{ value: keyword, onChange: setKeyword, placeholder: "搜索热榜关键词 / 平台" }}
        onRefresh={refresh}
        countdown={left}
      >
        {categories.map(item => (
          <Pill
            key={item.name}
            label={item.name}
            count={item.count}
            active={item.name === category}
            color={categoryColor(item.name)}
            onClick={() => setCategory(item.name)}
          />
        ))}
      </BoardToolbar>

      {isError && (
        <div className={boardNoticeClass()}>
          平台列表获取失败，请稍后重试（热榜服务已内置于站点，无需单独启动）
        </div>
      )}

      <SortableBoard
        storageKey="hotboard"
        ids={list.map(platform => platform.id)}
        className={BOARD_GRID_CLASS}
        renderCard={(id, sortable) => {
          const platform = list.find(item => item.id === id)
          if (!platform) return null
          return (
            <PlatformCard
              key={id}
              platform={platform}
              keyword={keyword}
              refreshKey={refreshKey}
              sortable={sortable}
            />
          )
        }}
      />

      {!!platforms && !list.length && (
        <div className={boardNoticeClass(true)}>
          没有匹配的榜单，换个关键词试试
        </div>
      )}
    </div>
  )
}
