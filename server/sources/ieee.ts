/**
 * 信息流源：IEEE Xplore —— IEEE 出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// IEEE Xplore（Crossref member 263）。
export default defineCrossrefSource("IEEE Xplore", 263)
