/**
 * 首页栏目卡片：一张卡内可切换多个数据源，支持刷新、关注与拖拽排序
 */
import type { NewsItem, SourceID, SourceResponse } from "@shared/types"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion, useInView } from "framer-motion"
import { useWindowSize } from "react-use"
import { forwardRef, useImperativeHandle } from "react"
import { colorOfSource } from "@shared/metadata"
import { BoardRow } from "../hotboard/board-row"
import { BoardScrollArea } from "../hotboard/board-scroll-area"
import { CardActions } from "../hotboard/card-actions"
import { PlatformIcon } from "../hotboard/platform-icon"
import { newsRow } from "../hotboard/row-data"
import { boardCardClass, safeParseString } from "~/utils"

export interface ItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  id: SourceID
  /**
   * 是否显示透明度，拖动时原卡片的样式
   */
  isDragging?: boolean
  setHandleRef?: (ref: HTMLElement | null) => void
}

interface NewsCardProps {
  id: SourceID
  setHandleRef?: (ref: HTMLElement | null) => void
}

export const CardWrapper = forwardRef<HTMLElement, ItemsProps>(({ id, isDragging, setHandleRef, style, ...props }, dndRef) => {
  const ref = useRef<HTMLDivElement>(null)

  const inView = useInView(ref, {
    once: true,
  })

  useImperativeHandle(dndRef, () => ref.current! as HTMLDivElement)

  const color = colorOfSource(id)

  return (
    <div
      ref={ref}
      className={$(
        boardCardClass(color, isDragging),
        "transition-opacity-300",
      )}
      style={{
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    >
      {inView && <NewsCard id={id} setHandleRef={setHandleRef} />}
    </div>
  )
})

function NewsCard({ id, setHandleRef }: NewsCardProps) {
  const { refresh } = useRefetch()
  const { data, isFetching, isError } = useQuery({
    queryKey: ["source", id],
    queryFn: async ({ queryKey }) => {
      const id = queryKey[1] as SourceID
      let url = `/s?id=${id}`
      const headers: Record<string, any> = {}
      if (refetchSources.has(id)) {
        url = `/s?id=${id}&latest`
        const jwt = safeParseString(localStorage.getItem("jwt"))
        if (jwt) headers.Authorization = `Bearer ${jwt}`
        refetchSources.delete(id)
      } else if (cacheSources.has(id)) {
        // wait animation
        await delay(200)
        return cacheSources.get(id)
      }

      const response: SourceResponse = await myFetch(url, {
        headers,
      })

      function diff() {
        try {
          if (response.items && sources[id].type === "hottest" && cacheSources.has(id)) {
            response.items.forEach((item, i) => {
              const o = cacheSources.get(id)!.items.findIndex(k => k.id === item.id)
              item.extra = {
                ...item?.extra,
                diff: o === -1 ? undefined : o - i,
              }
            })
          }
        } catch (e) {
          console.error(e)
        }
      }

      diff()

      cacheSources.set(id, response)
      return response
    },
    placeholderData: prev => prev,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { isFocused, toggleFocus } = useFocusWith(id)
  const color = colorOfSource(id)

  return (
    <>
      <div className="flex items-center gap-2 min-w-0">
        <PlatformIcon
          id={id}
          name={sources[id].name}
          href={sources[id].home}
          title={sources[id].desc}
        />
        <span className="flex flex-col min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-xl font-bold truncate" title={sources[id].desc}>
              {sources[id].name}
            </span>
            {sources[id]?.title && (
              <span className={$(
                "text-xs px-1.5 py-0.5 rounded-full bg-base bg-op-50! op-80 whitespace-nowrap",
                `color-${color}`,
              )}
              >
                {sources[id].title}
              </span>
            )}
          </span>
          <span className="text-xs op-70 truncate">
            <UpdatedTime isError={isError} updatedTime={data?.updatedTime} />
          </span>
        </span>
        <div className="ml-auto">
          <CardActions
            color={color}
            busy={isFetching}
            onRefresh={() => refresh(id)}
            focused={isFocused}
            onToggleFocus={toggleFocus}
            setHandleRef={setHandleRef}
          />
        </div>
      </div>

      <BoardScrollArea color={color} busy={isFetching}>
        {!!data?.items?.length && (sources[id].type === "hottest"
          ? <NewsListHot items={data.items} color={color} />
          : <NewsListTimeLine items={data.items} />)}
      </BoardScrollArea>
    </>
  )
}

function UpdatedTime({ isError, updatedTime }: { updatedTime: any, isError: boolean }) {
  const relativeTime = useRelativeTime(updatedTime ?? "")
  if (relativeTime) return `${relativeTime}更新`
  if (isError) return "获取失败"
  return "加载中..."
}

function DiffNumber({ diff }: { diff: number }) {
  const [shown, setShown] = useState(true)
  useEffect(() => {
    setShown(true)
    const timer = setTimeout(() => {
      setShown(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [setShown, diff])

  return (
    <AnimatePresence>
      { shown && (
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={$("shrink-0 text-xs op-70", diff < 0 ? "text-green" : "text-red")}
        >
          {diff > 0 ? `+${diff}` : diff}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
function ExtraInfo({ item }: { item: NewsItem }) {
  if (item?.extra?.info) {
    return <>{item.extra.info}</>
  }
  if (item?.extra?.icon) {
    const { url, scale } = typeof item.extra.icon === "string" ? { url: item.extra.icon, scale: undefined } : item.extra.icon
    return (
      <img
        src={url}
        style={{
          transform: `scale(${scale ?? 1})`,
        }}
        className="h-4 inline mt--1"
        referrerPolicy="no-referrer"
        onError={e => e.currentTarget.style.display = "none"}
      />
    )
  }
}

function NewsUpdatedTime({ date }: { date: string | number }) {
  const relativeTime = useRelativeTime(date)
  return <>{relativeTime}</>
}
/** 热榜类源：序号 + 标题 + 排名涨跌 + 来源附加信息，条目样式与广场卡片一致 */
function NewsListHot({ items, color }: { items: NewsItem[], color: string }) {
  const { width } = useWindowSize()
  return (
    <ol className="flex flex-col gap-1">
      {items?.map((item, i) => (
        <BoardRow
          key={item.id}
          row={{
            ...newsRow(item),
            // 窄屏优先跳移动端页面，与「实时」流保持一致
            url: (width < 768 ? item.mobileUrl || item.url : item.url) ?? undefined,
          }}
          index={i}
          color={color}
          variant="dense"
        >
          {!!item.extra?.diff && <DiffNumber diff={item.extra.diff} />}
          <ExtraInfo item={item} />
        </BoardRow>
      ))}
    </ol>
  )
}

function NewsListTimeLine({ items }: { items: NewsItem[] }) {
  const { width } = useWindowSize()
  return (
    <ol className="border-s border-neutral-400/50 flex flex-col ml-1">
      {items?.map(item => (
        <li key={`${item.id}-${item.pubDate || item?.extra?.date || ""}`} className="flex flex-col">
          <span className="flex items-center gap-1 text-neutral-400/50 ml--1px">
            <span className="">-</span>
            <span className="text-xs text-neutral-400/80">
              {!!(item.pubDate || item?.extra?.date) && <NewsUpdatedTime date={(item.pubDate || item?.extra?.date)!} />}
            </span>
            <span className="text-xs text-neutral-400/80">
              <ExtraInfo item={item} />
            </span>
          </span>
          <a
            className={$(
              "ml-2 px-1 hover:bg-neutral-400/10 rounded-md visited:(text-neutral-400/80)",
              "cursor-pointer [&_*]:cursor-pointer transition-all",
            )}
            href={width < 768 ? item.mobileUrl || item.url : item.url}
            title={item.extra?.hover}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  )
}
