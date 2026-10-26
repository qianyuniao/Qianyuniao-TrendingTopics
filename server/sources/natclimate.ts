/**
 * 信息流源：Nature Climate Change —— Nature 子刊 Nature Climate Change 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Climate Change", "https://www.nature.com/nclimate.rss")
