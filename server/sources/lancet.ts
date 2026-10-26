/**
 * 信息流源：The Lancet —— 柳叶刀：全球最具影响力医学期刊之一
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// The Lancet
export default defineJournalSource("The Lancet", "https://rss.sciencedirect.com/publication/science/01406736")
