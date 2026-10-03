/**
 * 数据源实现汇总表
 * 通过构建期 glob 插件（tools/rollup-glob）收集 `server/sources` 下的所有模块，
 * **文件名即 source id**；模块有两种形态：
 * - `export default defineSource(...)`：一个文件一个源
 * - `export default { id: getter, ... }`：一个文件多个源
 */
import type { SourceID } from "@shared/types"
import * as x from "glob:./sources/{*.ts,**/index.ts}"
import type { SourceGetter } from "./types"

export const getters = (function () {
  const getters = {} as Record<SourceID, SourceGetter>
  typeSafeObjectEntries(x).forEach(([id, x]) => {
    if (x.default instanceof Function) {
      Object.assign(getters, { [id]: x.default })
    } else {
      Object.assign(getters, x.default)
    }
  })
  return getters
})()
