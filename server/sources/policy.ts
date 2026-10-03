import type { SourceGetter } from "#/types"
import { definePolicySource, policySources } from "../utils/policy"

/**
 * 政策源集合：一个文件汇总所有职能部门政策源，新增部门只需改 server/utils/policy.ts 的配置。
 * 默认导出为 { sourceId: getter } 形式，由 server/getters.ts 的 glob 收集器统一装载。
 */
const map: Record<string, SourceGetter> = Object.fromEntries(
  policySources.map(cfg => [cfg.id, definePolicySource(cfg)]),
) as Record<string, SourceGetter>

export default map
