/**
 * 信息流源：Web of Science —— 跨学科引文索引，经 Crossref 呈现近一年高被引论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// Web of Science 为跨学科引文索引（无自身论文），
// 用 Crossref 按「近一年高被引」呈现，符合其引文索引定位。
export default defineCrossrefSource("Web of Science", null, { sort: "is-referenced-by-count", days: 365 })
