/**
 * 信息流源：SAGE Journals —— SAGE 出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// SAGE Journals（SAGE Publications，Crossref member 179）。
export default defineCrossrefSource("SAGE Journals", 179)
