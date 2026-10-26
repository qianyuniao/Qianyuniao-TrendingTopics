/**
 * 信息流源：Nature Communications —— Nature 子刊 Nature Communications 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Communications", "https://www.nature.com/ncomms.rss")
