/**
 * 短视频聚合看板：抖音 / 快手 / B 站等视频平台热点
 */
import { createFileRoute } from "@tanstack/react-router"
import { ALL_CATEGORY, VIDEO_PLATFORM_HOMES, VIDEO_PLATFORM_IDS, isVideoPlatform, platformColor } from "@shared/hotboard"
import { PortalLinks } from "~/components/common/portal-links"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { Pill } from "~/components/hotboard/pill"
import { PlatformCard } from "~/components/hotboard/platform-card"
import { PlatformIcon } from "~/components/hotboard/platform-icon"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { HOTBOARD_REFRESH_SECONDS, useHotboardPlatforms } from "~/hooks/useHotboard"
import { BOARD_GRID_CLASS, BOARD_PAGE_CLASS, boardNoticeClass } from "~/utils"

export const Route = createFileRoute("/shortvideo")({
  component: ShortVideoBoard,
})

function ShortVideoBoard() {
  const [current, setCurrent] = useState(ALL_CATEGORY)
  const [keyword, setKeyword] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const { left, reset } = useCountdown(HOTBOARD_REFRESH_SECONDS)
  const { data: platforms, isError } = useHotboardPlatforms()

  /** 视频平台（短视频 / 长视频 / 直播），按预设顺序排列 */
  const list = useMemo(() => {
    return (platforms ?? [])
      .filter(item => isVideoPlatform(item.id))
      .sort((a, b) => VIDEO_PLATFORM_IDS.indexOf(a.id as any) - VIDEO_PLATFORM_IDS.indexOf(b.id as any))
  }, [platforms])

  const visible = useMemo(
    () => (current === ALL_CATEGORY ? list : list.filter(item => item.id === current)),
    [list, current],
  )

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
    reset()
  }, [reset])

  const focused = current !== ALL_CATEGORY
  const activeColor = focused ? platformColor(current) : "primary"

  return (
    <div className={BOARD_PAGE_CLASS}>
      <BoardToolbar
        color={activeColor}
        title="视频热榜"
        titleIcon="i-ph:video-camera-duotone text-3xl"
        badge={platforms ? `${list.length} 个平台` : "加载中..."}
        hint={list.length ? `${list.map(item => item.name).join(" · ")} 实时热榜聚合` : ""}
        search={{ value: keyword, onChange: setKeyword }}
        onRefresh={refresh}
        countdown={left}
      >
        <Pill
          label={ALL_CATEGORY}
          count={list.length}
          active={!focused}
          color="primary"
          onClick={() => setCurrent(ALL_CATEGORY)}
        />
        {list.map(item => (
          <Pill
            key={item.id}
            label={item.name}
            icon={<PlatformIcon id={item.id} name={item.name} className="w-5 h-5" />}
            active={current === item.id}
            color={platformColor(item.id)}
            onClick={() => setCurrent(item.id)}
          />
        ))}
        <PortalLinks
          groups={[{
            label: "平台官网",
            links: list
              .map(item => ({ label: item.name, href: VIDEO_PLATFORM_HOMES[item.id] }))
              .filter((l): l is { label: string, href: string } => !!l.href),
          }].filter(g => g.links.length)}
          from="#22d3ee"
          to="#a78bfa"
        />
      </BoardToolbar>

      {isError && (
        <div className={boardNoticeClass()}>
          平台列表获取失败，请稍后重试（热榜服务已内置于站点，无需单独启动）
        </div>
      )}

      <SortableBoard
        storageKey="shortvideo"
        ids={visible.map(item => item.id)}
        className={BOARD_GRID_CLASS}
        renderCard={(id, sortable) => {
          const item = visible.find(i => i.id === id)
          if (!item) return null
          return (
            <PlatformCard
              key={id}
              platform={item}
              keyword={keyword}
              refreshKey={refreshKey}
              showCover
              showMeta
              showType
              rowVariant="normal"
              sortable={sortable}
            />
          )
        }}
      />

      {!!platforms && !visible.length && (
        <div className={boardNoticeClass(true)}>
          没有匹配的视频平台
        </div>
      )}
    </div>
  )
}
