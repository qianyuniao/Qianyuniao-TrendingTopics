/**
 * 信息流源：EBSCO —— 跨学科聚合库，经 Crossref 呈现全学科最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// EBSCO（Academic Search Complete）为跨学科聚合库（无自身论文），
// 用 Crossref 按「全学科最新上线」呈现。
export default defineCrossrefSource("EBSCO", null, { sort: "created", days: 14 })
