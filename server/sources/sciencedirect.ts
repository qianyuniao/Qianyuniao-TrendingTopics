/**
 * 信息流源：ScienceDirect —— Elsevier 出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// ScienceDirect（Elsevier，Crossref member 78）：用 Crossref 拉取最新论文。
export default defineCrossrefSource("ScienceDirect", 78)
