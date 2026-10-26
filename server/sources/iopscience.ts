/**
 * 信息流源：IOPscience —— 英国物理学会出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// IOPscience（英国皇家物理学会 IOP Publishing，Crossref member 266）。
export default defineCrossrefSource("IOPscience", 266)
