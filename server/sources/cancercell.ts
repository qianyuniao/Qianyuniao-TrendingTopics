/**
 * 信息流源：Cancer Cell —— 细胞 Press：肿瘤学顶级期刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Cancer Cell
export default defineJournalSource("Cancer Cell", "https://rss.sciencedirect.com/publication/science/15356108")
