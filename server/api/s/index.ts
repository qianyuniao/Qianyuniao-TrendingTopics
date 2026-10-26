/**
 * GET /api/s?id=xxx —— 单个信息流源的数据接口
 * 取数优先级：命中刷新间隔直接用缓存 → 命中 TTL 用缓存（未登录或不要最新时）→ 实时抓取
 * 抓取失败但存在旧缓存时降级返回缓存，避免上游抖动导致看板空白
 */
import type { SourceID, SourceResponse } from "@shared/types"
import { getters } from "#/getters"
import { getCacheTable } from "#/database/cache"
import type { CacheInfo } from "#/types"

export default defineEventHandler(async (event): Promise<SourceResponse> => {
  try {
    const query = getQuery(event)
    const latest = query.latest !== undefined && query.latest !== "false"
    let id = query.id as SourceID
    const isValid = (id: SourceID) => !id || !sources[id] || !getters[id]

    if (isValid(id)) {
      const redirectID = sources?.[id]?.redirect
      if (redirectID) id = redirectID
      if (isValid(id)) throw new Error("Invalid source id")
    }

    const cacheTable = await getCacheTable()
    // Date.now() in Cloudflare Worker will not update throughout the entire runtime.
    const now = Date.now()
    let cache: CacheInfo | undefined
    if (cacheTable) {
      cache = await cacheTable.get(id)
      if (cache) {
        // interval 刷新间隔，对于缓存失效也要执行的。本质上表示本来内容更新就很慢，这个间隔内可能内容压根不会更新。
        // 默认 10 分钟，是低于 TTL 的，但部分 Source 的更新间隔会超过 TTL，甚至有的一天更新一次。
        if (now - cache.updated < sources[id].interval) {
          return {
            status: "success",
            id,
            updatedTime: now,
            items: cache.items,
          }
        }

        // 而 TTL 缓存失效时间，在时间范围内，就算内容更新了也要用这个缓存。
        // 复用缓存是不会更新时间的。
        if (now - cache.updated < TTL) {
          // 有 latest
          // 没有 latest，但服务器禁止登录

          // 没有 latest
          // 有 latest，服务器可以登录但没有登录
          if (!latest || (!event.context.disabledLogin && !event.context.user)) {
            return {
              status: "cache",
              id,
              updatedTime: cache.updated,
              items: cache.items,
            }
          }
        }
      }
    }

    try {
      const newData = (await getters[id]()).slice(0, 30)
      if (cacheTable && newData.length) {
        if (event.context.waitUntil) event.context.waitUntil(cacheTable.set(id, newData))
        else await cacheTable.set(id, newData)
      }
      logger.success(`fetch ${id} latest`)
      return {
        status: "success",
        id,
        updatedTime: now,
        items: newData,
      }
    } catch (e) {
      if (cache!) {
        return {
          status: "cache",
          id,
          updatedTime: cache.updated,
          items: cache.items,
        }
      } else {
        throw e
      }
    }
  } catch (e: any) {
    logger.error(e)
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error",
    })
  }
})
