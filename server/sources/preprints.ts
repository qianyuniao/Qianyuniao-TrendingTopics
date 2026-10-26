/**
 * 信息流源：Preprints.org —— 多学科预印本平台最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Preprints.org
export default defineJournalSource("Preprints.org", "https://www.preprints.org/rss/feed")
