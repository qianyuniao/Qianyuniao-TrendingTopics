/**
 * 信息流源：Nature Medicine —— Nature 子刊 Nature Medicine 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Medicine", "https://www.nature.com/nm.rss")
