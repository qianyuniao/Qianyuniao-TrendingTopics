/**
 * 信息流源：Cell Reports —— 细胞 Press：Cell 主刊研究论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Cell Reports
export default defineJournalSource("Cell Reports", "https://rss.sciencedirect.com/publication/science/22111247")
