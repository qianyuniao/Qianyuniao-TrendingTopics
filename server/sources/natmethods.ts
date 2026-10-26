/**
 * 信息流源：Nature Methods —— Nature 子刊 Nature Methods 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Methods", "https://www.nature.com/nmeth.rss")
