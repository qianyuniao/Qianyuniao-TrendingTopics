import { useQuery } from "@tanstack/react-query"
import type { HotboardPlatform, HotboardResponse } from "@shared/hotboard"

/** 热榜自动刷新间隔（秒） */
export const HOTBOARD_REFRESH_SECONDS = 5 * 60

/** 平台列表：三个热榜页面共用，10 分钟内不重复请求 */
export function useHotboardPlatforms() {
  return useQuery({
    queryKey: ["hotboard-platforms"],
    queryFn: () => myFetch<HotboardPlatform[]>("/hotboard"),
    staleTime: 1000 * 60 * 10,
    retry: false,
  })
}

/**
 * 单个平台的热榜数据
 * `enabled` 用于视口懒加载（进入可视区才真正请求）
 */
export function useHotboardData(id: string, refreshKey: number, enabled = true) {
  return useQuery({
    queryKey: ["hotboard", id, refreshKey],
    queryFn: () => myFetch<HotboardResponse>(`/hotboard/${id}`),
    enabled,
    refetchInterval: HOTBOARD_REFRESH_SECONDS * 1000,
    staleTime: 0,
    retry: false,
  })
}
