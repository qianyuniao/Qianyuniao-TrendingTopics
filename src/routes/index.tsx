/**
 * 首页：按栏目并排展示各数据源的信息流卡片
 */
import { createFileRoute } from "@tanstack/react-router"
import { focusSourcesAtom } from "~/atoms"
import { Column } from "~/components/column"
import { FocusBoard } from "~/components/focus"

export const Route = createFileRoute("/")({
  component: IndexComponent,
})

function IndexComponent() {
  const focusSources = useAtomValue(focusSourcesAtom)
  // 有收藏时首页即收藏看板，否则回落到「最热」专栏
  return focusSources.length ? <FocusBoard /> : <Column id="hottest" />
}
