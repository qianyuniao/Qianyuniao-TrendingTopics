/**
 * 信息流源：Cancers —— Cancers 期刊最新发表论文（肿瘤学）
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Cancers（MDPI，肿瘤学）
export default defineJournalSource("Cancers", "https://www.mdpi.com/rss/journal/cancers")
