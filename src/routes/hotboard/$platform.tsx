/**
 * 单平台热榜详情页：展示该平台完整榜单
 * 子榜单（参数）选择值放在 URL search 上，切换时只重新请求数据，便于分享与回退
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { HotboardResponse } from "@shared/hotboard"
import { categoryOf, platformColor } from "@shared/hotboard"
import type { SourceID } from "@shared/types"
import { BoardRow } from "~/components/hotboard/board-row"
import { CardActions } from "~/components/hotboard/card-actions"
import { PlatformIcon } from "~/components/hotboard/platform-icon"
import { RefreshButton } from "~/components/hotboard/refresh-button"
import { useHotboardPlatforms } from "~/hooks/useHotboard"
import { BOARD_CARD_BASE } from "~/utils"

export const Route = createFileRoute("/hotboard/$platform")({
  validateSearch: (search: Record<string, unknown>): Record<string, string> => {
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries(search)) {
      if (typeof value === "string" && value) params[key] = value
    }
    return params
  },
  component: HotboardPlatformPage,
})

function HotboardPlatformPage() {
  const { platform } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { data: platforms } = useHotboardPlatforms()
  const meta = platforms?.find(item => item.id === platform)

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["hotboard", platform, search],
    queryFn: () => myFetch<HotboardResponse>(`/hotboard/${platform}`, { query: search }),
    placeholderData: prev => prev,
    retry: false,
  })

  const setOption = useCallback((name: string, value: string) => {
    navigate({
      search: prev => ({ ...prev, [name]: value }),
      replace: true,
    })
  }, [navigate])

  const color = platformColor(platform)
  const category = categoryOf(platform)
  const { isFocused, toggleFocus } = useFocusWith(platform as SourceID)

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-3">
      <div className={$(
        BOARD_CARD_BASE,
        "gap-3",
        `bg-${color}-500 dark:bg-${color} bg-op-40!`,
        `sprinkle-${color}`,
      )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/hotboard"
            className={$("btn i-ph:arrow-left-duotone text-lg", `color-${color}`)}
            title="返回热榜广场"
          />
          <PlatformIcon id={platform} name={meta?.name ?? data?.name} />
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-xl font-bold truncate">{data?.name ?? meta?.name ?? platform}</span>
            <span className={$("text-xs px-1.5 py-0.5 rounded-full bg-base bg-op-50! op-80 whitespace-nowrap", `color-${color}`)}>
              {category}
            </span>
            {data?.type && (
              <span className={$("text-xs px-1.5 py-0.5 rounded-full bg-base bg-op-50! op-80 whitespace-nowrap", `color-${color}`)}>
                {data.type}
              </span>
            )}
            <span className="text-xs op-70 whitespace-nowrap">{data ? `${data.total} 条` : "加载中..."}</span>
          </span>
          <div className="ml-auto">
            <CardActions
              color={color}
              busy={isFetching}
              onRefresh={() => refetch()}
              focused={isFocused}
              onToggleFocus={toggleFocus}
            />
          </div>
        </div>

        {!!meta?.options.length && (
          <div className="flex w-full flex-wrap items-center gap-3 border-t border-neutral-400/20 pt-2">
            {meta.options.map(option => (
              <label key={option.name} className="flex items-center gap-2 text-sm">
                <span className="op-70">{option.name}</span>
                <select
                  className={$(
                    "rounded-full px-3 py-1 bg-neutral-400/10 cursor-pointer",
                    "hover:(bg-neutral-400/20) transition-all",
                  )}
                  value={search[option.name] ?? String(option.default ?? "")}
                  onChange={e => setOption(option.name, e.target.value)}
                >
                  {(option.choices ?? [String(option.default ?? "")]).map(choice => (
                    <option key={choice} value={choice}>{choice}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
      </div>

      {isError && (
        <div className={$(
          "flex flex-wrap items-center gap-3 rounded-2xl p-4 text-sm",
          "bg-base bg-op-85!",
          `sprinkle-${color}`,
        )}
        >
          <span className="op-80">
            {`获取失败：${String(error?.message ?? "未获取到数据")}`}
          </span>
          <RefreshButton
            color={color}
            title="重试"
            className="ml-auto"
            onClick={() => refetch()}
          />
        </div>
      )}

      <div className={$(
        "rounded-2xl p-3 transition-all",
        "bg-base bg-op-85!",
        `sprinkle-${color}`,
        isFetching && "animate-pulse",
      )}
      >
        <ol className="flex flex-col gap-1">
          {data?.items.map((item, index) => (
            <BoardRow
              key={item.id ?? index}
              item={item}
              index={index}
              color={color}
              variant="detail"
              showDesc
              showMeta
            />
          ))}
          {!data?.items.length && (
            <li className="text-sm op-60 py-2 px-1">
              {isError ? "数据源异常（上游反爬或超时），点右上角重试" : "加载中..."}
            </li>
          )}
        </ol>
      </div>
    </div>
  )
}
