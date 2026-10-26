/**
 * 信息流源：Immunity —— 细胞 Press：免疫学顶级期刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Immunity
export default defineJournalSource("Immunity", "https://rss.sciencedirect.com/publication/science/10747613")
