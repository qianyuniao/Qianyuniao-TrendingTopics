/**
 * 信息流源：Nature Materials —— Nature 子刊 Nature Materials 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Materials", "https://www.nature.com/nmat.rss")
