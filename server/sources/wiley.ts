/**
 * 信息流源：Wiley Online Library —— Wiley 出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// Wiley Online Library（Crossref member 311）。
export default defineCrossrefSource("Wiley Online Library", 311)
