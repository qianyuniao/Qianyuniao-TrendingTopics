/**
 * 信息流源：Reaxys —— 化学数据库，经 Crossref 呈现化学领域最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// Reaxys 为化学数据库（无自身论文），以化学领域权威 RSC 最新论文呈现
// （Royal Society of Chemistry，Crossref member 292）。
export default defineCrossrefSource("Reaxys", 292)
