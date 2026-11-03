import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { HotboardPlatform, HotboardResponse } from "@shared/hotboard"

/** 热榜自动刷新间隔（秒） */
export const HOTBOARD_REFRESH_SECONDS = 5 * 60

/** 平台列表：三个热榜页面共用，10 分钟内不重复请求 */
export function useHotboardPlatforms() {
  return useQuery({
    queryKey: ["hotboard-platforms"],
    queryFn: async () => {
      // 生产（Pages 纯静态托管）读构建时生成的快照 JSON；开发走 Nitro 服务端
      const d = await fetchLiveOrSnapshot("/hotboard", "/hotboard.json")
      // 兜底：接口异常/返回非数组时给空列表，渲染层不会因 .filter 崩溃
      return Array.isArray(d) ? (d as HotboardPlatform[]) : []
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  })
}

/**
 * 单个平台的热榜数据
 * `enabled` 用于视口懒加载（进入可视区才真正请求）
 *
 * 生产环境策略：先用构建期快照秒开，同时后台请求服务端实时数据，
 * 拿到后替换缓存 —— 既有即时渲染，又能实时更新（服务端要逐个抓上游，冷启动较慢）。
 */
export function useHotboardData(id: string, refreshKey: number, enabled = true) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["hotboard", id, refreshKey],
    queryFn: async () => {
      if (!import.meta.env.PROD) return myFetch<HotboardResponse>(`/hotboard/${id}`)

      const snapshot = await myFetch<HotboardResponse>(`/hotboard/${id}.json`).catch(() => undefined)
      const live = myFetch<HotboardResponse>(`/hotboard/${id}`)
        .then((data) => {
          if (data?.items?.length) queryClient.setQueryData(["hotboard", id, refreshKey], data)
          return data
        })
        .catch(() => undefined)
      if (snapshot?.items?.length) return snapshot
      return (await live) ?? snapshot ?? { id, total: 0, items: [] } as unknown as HotboardResponse
    },
    enabled,
    refetchInterval: HOTBOARD_REFRESH_SECONDS * 1000,
    staleTime: 0,
    retry: false,
  })
}
