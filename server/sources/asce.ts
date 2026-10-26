/**
 * 信息流源：ASCE Library —— 美国土木工程师学会出版平台，经 Crossref 实时获取最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineCrossrefSource } from "../utils/journal"

// ASCE Library（American Society of Civil Engineers，Crossref member 30）。
export default defineCrossrefSource("ASCE Library", 30)
