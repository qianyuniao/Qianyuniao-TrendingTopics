/**
 * 顶部导航栏：在栏目、热榜、广场之间切换并高亮当前位置
 */
import { fixedColumnIds, journalSet, metadata } from "@shared/metadata"
import { Link, useRouterState } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { opened, toggle } = useSearchBar()
  const pathname = useRouterState({ select: state => state.location.pathname })
  const isHotboard = pathname.startsWith("/hotboard")
  const isShortVideo = pathname.startsWith("/shortvideo")
  const isColumnRoute = pathname.startsWith("/c/")
  // 注意：currentColumnIDAtom 离开列路由后不会重置，
  // 因此「最热/实时/顶刊」必须叠加 isColumnRoute 判断，
  // 否则会出现「视频」与上次访问的列同时高亮
  const isJournals = pathname.startsWith("/journals") || (isColumnRoute && journalSet.has(currentId))
  const isPolicies = pathname.startsWith("/policies")
  const isDashboard = pathname.startsWith("/dashboard")
  const isFocus = pathname.startsWith("/focus")

  // 深色背景下继承色 + 低透明度会导致导航文字几乎看不见，
  // 这里显式指定两套模式下的文字色，保证与背景的对比度
  const itemClass = (active = false) => $(
    "meteor-ring px-2 rounded-md cursor-pointer transition-all whitespace-nowrap",
    active
      ? "color-primary font-bold"
      : "color-neutral-600 dark:color-neutral-200 hover:(color-primary bg-primary/10)",
  )

  // 顶刊下的 23 个期刊不单独占用一级 tab，统一收进「顶刊」广场入口
  // 「收藏」是独立的 /focus 看板页（见 src/routes/focus.tsx），不占用栏目 tab
  const otherColumnIds = fixedColumnIds.filter(id => !journalSet.has(id) && id !== "focus")

  return (
    <span className={$([
      "flex p-3 rounded-2xl text-sm",
      // 加深底色并补一道边框，让导航条从页面背景中分离出来
      "bg-primary/5 dark:bg-primary/10 border border-primary/20",
      "shadow shadow-primary/20 hover:shadow-primary/50 transition-shadow-500",
    ])}
    >
      <Link
        to="/hotboard"
        className={itemClass(isHotboard)}
      >
        热榜
      </Link>
      <Link
        to="/shortvideo"
        className={itemClass(isShortVideo)}
      >
        视频
      </Link>
      {otherColumnIds.map(columnId => (
        <Link
          key={columnId}
          to="/c/$column"
          params={{ column: columnId }}
          className={itemClass(isColumnRoute && currentId === columnId)}
        >
          {metadata[columnId].name}
        </Link>
      ))}
      <Link
        to="/journals"
        className={itemClass(isJournals)}
      >
        顶刊
      </Link>
      <Link
        to="/policies"
        className={itemClass(isPolicies)}
      >
        政策
      </Link>
      <Link
        to="/dashboard"
        className={itemClass(isDashboard)}
      >
        数据看板
      </Link>
      <Link
        to="/focus"
        className={itemClass(isFocus)}
      >
        收藏
      </Link>
      <button
        type="button"
        onClick={() => toggle(true)}
        className={itemClass(opened)}
      >
        更多
      </button>
    </span>
  )
}
