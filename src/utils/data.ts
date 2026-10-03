import type { SourceID, SourceResponse } from "@shared/types"

/** 数据源结果内存缓存：按 source id 保存，切换栏目时命中即无需重新请求 */
export const cacheSources = new Map<SourceID, SourceResponse>()

/** 待重新拉取的数据源集合：刷新 / 同步时由相应 hook 填充 */
export const refetchSources = new Set<SourceID>()
