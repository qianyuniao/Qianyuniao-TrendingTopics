import { createFileRoute } from "@tanstack/react-router"
import { ALL_CATEGORY, SHORT_VIDEO_PLATFORM_HOMES, SHORT_VIDEO_PLATFORM_IDS, isShortVideoPlatform, platformColor } from "@shared/hotboard"
import { PortalLinks } from "~/components/common/portal-links"
import { BoardToolbar } from "~/components/hotboard/board-toolbar"
import { Pill } from "~/components/hotboard/pill"
import { PlatformCard } from "~/components/hotboard/platform-card"
import { PlatformIcon } from "~/components/hotboard/platform-icon"
import { SortableBoard } from "~/components/hotboard/sortable-board"
import { HOTBOARD_REFRESH_SECONDS, useHotboardPlatforms } from "~/hooks/useHotboard"

export const Route = createFileRoute("/shortvideo")({
  component: ShortVideoBoard,
})

function ShortVideoBoard() {
  const [current, setCurrent] = useState(ALL_CATEGORY)
  const [keyword, setKeyword] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const { left, reset } = useCountdown(HOTBOARD_REFRESH_SECONDS)
  const { data: platforms, isError } = useHotboardPlatforms()

  /** 短视频平台，按预设顺序排列 */
  const list = useMemo(() => {
    return (platforms ?? [])
      .filter(item => isShortVideoPlatform(item.id))
      .sort((a, b) => SHORT_VIDEO_PLATFORM_IDS.indexOf(a.id as any) - SHORT_VIDEO_PLATFORM_IDS.indexOf(b.id as any))
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
    <div className="flex flex-col gap-4 p-2 sm:p-3">
      <BoardToolbar
        color={activeColor}
        title="短视频热榜"
        titleIcon="i-ph:play-circle-duotone text-3xl"
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
              .map(item => ({ label: item.name, href: SHORT_VIDEO_PLATFORM_HOMES[item.id] }))
              .filter((l): l is { label: string, href: string } => !!l.href),
          }].filter(g => g.links.length)}
          from="#22d3ee"
          to="#a78bfa"
        />
      </BoardToolbar>

      {isError && (
        <div className="rounded-2xl p-4 bg-base bg-op-85! sprinkle-primary text-sm">
          平台列表获取失败，请稍后重试（热榜服务已内置于站点，无需单独启动）
        </div>
      )}

      <SortableBoard
        storageKey="shortvideo"
        ids={visible.map(item => item.id)}
        className={$("grid gap-4", "sm:(grid-cols-2)", !focused && "lg:(grid-cols-3)")}
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
        <div className="rounded-2xl p-6 bg-base bg-op-85! text-sm op-70 text-center">
          没有匹配的短视频平台
        </div>
      )}
    </div>
  )
}
