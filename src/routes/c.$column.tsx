/**
 * 专栏详情页 /c/:column：单栏目的全量信息流
 */
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Column } from "~/components/column"

export const Route = createFileRoute("/c/$column")({
  component: SectionComponent,
  params: {
    parse: (params) => {
      const raw = params.column?.toLowerCase()
      // 收藏已独立为 /focus 看板页，旧的「关注」栏目入口统一跳转过去
      if (raw === "focus") throw redirect({ to: "/focus" })
      const column = fixedColumnIds.find(x => x === raw)
      if (!column) throw new Error(`"${params.column}" is not a valid column.`)
      return {
        column,
      }
    },
    stringify: params => params,
  },
  onError: (error) => {
    if (error?.routerCode === "PARSE_PARAMS") {
      throw redirect({ to: "/" })
    }
  },
})

function SectionComponent() {
  const { column } = Route.useParams()
  return <Column id={column} />
}
