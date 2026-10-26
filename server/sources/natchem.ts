/**
 * 信息流源：Nature Chemistry —— Nature 子刊 Nature Chemistry 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Chemistry", "https://www.nature.com/nchem.rss")
