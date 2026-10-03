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
  // 否则会出现「短视频」与上次访问的列同时高亮
  const isJournals = pathname.startsWith("/journals") || (isColumnRoute && journalSet.has(currentId))
  const isPolicies = pathname.startsWith("/policies")
  const isDashboard = pathname.startsWith("/dashboard")

  const itemClass = (active = false) => $(
    "meteor-ring px-2 rounded-md cursor-pointer transition-all whitespace-nowrap",
    active ? "color-primary font-bold" : "op-85 dark:op-100 hover:(bg-primary/10)",
  )

  // 顶刊下的 23 个期刊不单独占用一级 tab，统一收进「顶刊」广场入口
  // 「关注」是空栏目（sources 为空），不再占用一级 tab，该位置改为「短视频」聚合看板
  const otherColumnIds = fixedColumnIds.filter(id => !journalSet.has(id) && id !== "focus")

  return (
    <span className={$([
      "flex p-3 rounded-2xl bg-primary/1 text-sm",
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
        短视频
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
