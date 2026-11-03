import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { SourceID, SourceResponse } from "@shared/types"

export function useUpdateQuery() {
  const queryClient = useQueryClient()

  /**
   * update query
   */
  return useCallback(async (...sources: SourceID[]) => {
    await queryClient.refetchQueries({
      predicate: (query) => {
        const [type, id] = query.queryKey as ["source" | "entire", SourceID]
        return type === "source" && sources.includes(id)
      },
    })
  }, [queryClient])
}

export function useEntireQuery(items: SourceID[]) {
  const update = useUpdateQuery()
  useQuery({
    // sort in place
    queryKey: ["entire", [...items].sort()],
    queryFn: async ({ queryKey }) => {
      const sources = queryKey[1]
      if (sources.length === 0) return null
      // 生产环境（Pages 纯静态托管）没有 /s/entire 批量接口，
      // 改为并行读取各源的静态快照 /api/s/<id>.json，单源失败不阻塞其他
      let res: SourceResponse[] | undefined
      try {
        res = await myFetch("/s/entire", {
          method: "POST",
          body: {
            sources,
          },
        })
      } catch {
        // 服务端不可用时回落到静态快照，逐个读取，单源失败不阻塞其他
        if (!import.meta.env.PROD) return null
        const snaps = await Promise.all((sources as SourceID[]).map(async (id: SourceID) => {
          try {
            return await myFetch<SourceResponse>(`/s/${id}.json`)
          } catch {
            return undefined
          }
        }))
        res = snaps.filter((v): v is SourceResponse => v != null)
      }
      if (!res?.length) return null
      if (res?.length) {
        const s = [] as SourceID[]
        res.forEach((v) => {
          const id = v.id
          if (!cacheSources.has(id) || cacheSources.get(id)!.updatedTime < v.updatedTime) {
            s.push(id)
            cacheSources.set(id, v)
          }
        })
        // update now
        update(...s)

        return res
      }
      return null
    },
    staleTime: 1000 * 60 * 3,
    retry: false,
  })
}
