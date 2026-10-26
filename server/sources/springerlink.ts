/**
 * 信息流源：SpringerLink —— Springer 出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// SpringerLink（Springer Science and Business Media，Crossref member 297）。
export default defineCrossrefSource("SpringerLink", 297)
