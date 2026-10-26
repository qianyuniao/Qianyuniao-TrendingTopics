/**
 * 「我的关注」页：只展示用户关注的数据源
 */
import { createFileRoute } from "@tanstack/react-router"
import { FocusBoard } from "~/components/focus"

export const Route = createFileRoute("/focus")({
  component: FocusBoard,
})
