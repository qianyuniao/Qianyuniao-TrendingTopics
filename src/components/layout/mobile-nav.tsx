/**
 * 移动端导航：补齐 `<md` 断点下缺失的栏目切换入口
 *
 * 桌面端由 `NavBar` 横向展示；窄屏（手机 / 平板竖屏）下 `NavBar` 被隐藏，
 * 此处提供一枚汉堡按钮，点击后从顶部滑下一块毛玻璃面板（Apple 风格 sheet），
 * 列出与桌面端完全一致的导航项，保证全设备可用且功能不变。
 */
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useRouterState } from "@tanstack/react-router"
import { fixedColumnIds, journalSet, metadata } from "@shared/metadata"
import { currentColumnIDAtom } from "~/atoms"
import { useSearchBar } from "~/hooks/useSearch"

interface NavItem {
  label: string
  to: string
  icon: string
  active: boolean
  /** 点击后额外行为，如打开搜索面板 */
  onClick?: () => void
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle: toggleSearch } = useSearchBar()
  const pathname = useRouterState({ select: state => state.location.pathname })

  const close = () => setOpen(false)

  // 与桌面端 NavBar 保持完全一致的激活判定
  const isHotboard = pathname.startsWith("/hotboard")
  const isShortVideo = pathname.startsWith("/shortvideo")
  const isColumnRoute = pathname.startsWith("/c/")
  const isJournals = pathname.startsWith("/journals") || (isColumnRoute && journalSet.has(currentId))
  const isPolicies = pathname.startsWith("/policies")
  const isDashboard = pathname.startsWith("/dashboard")
  const isFocus = pathname.startsWith("/focus")

  const otherColumnIds = fixedColumnIds.filter(id => !journalSet.has(id) && id !== "focus")

  const items: NavItem[] = [
    { label: "热榜", to: "/hotboard", icon: "i-ph:fire-duotone", active: isHotboard },
    { label: "视频", to: "/shortvideo", icon: "i-ph:video-camera-duotone", active: isShortVideo },
    ...otherColumnIds.map(columnId => ({
      label: metadata[columnId].name,
      to: `/c/${columnId}`,
      icon: "i-ph:newspaper-clipping-duotone",
      active: isColumnRoute && currentId === columnId,
    })),
    { label: "顶刊", to: "/journals", icon: "i-ph:book-open-duotone", active: isJournals },
    { label: "政策", to: "/policies", icon: "i-ph:scroll-duotone", active: isPolicies },
    { label: "数据看板", to: "/dashboard", icon: "i-ph:chart-bar-duotone", active: isDashboard },
    { label: "收藏", to: "/focus", icon: "i-ph:bookmark-simple-duotone", active: isFocus },
    {
      label: "更多",
      to: "#",
      icon: "i-ph:magnifying-glass-duotone",
      active: false,
      onClick: () => {
        close()
        toggleSearch(true)
      },
    },
  ]

  return (
    <>
      {/* 仅窄屏可见的汉堡按钮，复用于同一栅格单元，避免挤占桌面布局 */}
      <button
        type="button"
        aria-label="打开导航菜单"
        aria-expanded={open}
        className="md:hidden btn i-ph:list-duotone text-xl"
        onClick={() => setOpen(v => !v)}
      />

      <AnimatePresence>
        {open && (
          <>
            {/* 背景遮罩：毛玻璃 + 轻暗化，点击任意处关闭 */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* 顶部下拉的导航面板：圆角底边 + 阴影 + 安全区适配 */}
            <motion.nav
              key="sheet"
              role="dialog"
              aria-label="站点导航"
              className={$(
                "fixed inset-x-0 top-0 z-50 md:hidden",
                "bg-base bg-op-95! backdrop-blur-xl",
                "rounded-b-3xl shadow-2xl",
                "px-5 pb-6 pt-[max(env(safe-area-inset-top),1rem)]",
                "flex flex-col gap-1",
              )}
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div className="flex items-center justify-between py-2 mb-1">
                <span className="text-sm font-medium op-60">导航</span>
                <button
                  type="button"
                  aria-label="关闭导航菜单"
                  className="btn i-ph:x-circle-duotone text-xl"
                  onClick={close}
                />
              </div>

              {items.map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    } else {
                      close()
                    }
                  }}
                  className={$(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-base",
                    "transition-all active:(scale-98 bg-primary/10)",
                    item.active
                      ? "color-primary font-semibold bg-primary/10"
                      : "color-base hover:bg-neutral-400/10",
                  )}
                >
                  <span className={$("text-xl", item.icon)} />
                  <span>{item.label}</span>
                  {item.active && <span className="i-ph:check-circle-duotone ml-auto text-lg" />}
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
