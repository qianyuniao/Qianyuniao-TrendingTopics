/**
 * 信息流源：PsycINFO —— APA 心理学数据库，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// PsycINFO（美国心理学会 APA，Crossref member 15）：以 APA 最新论文呈现。
export default defineCrossrefSource("PsycINFO", 15)
