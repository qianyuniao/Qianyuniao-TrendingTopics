/**
 * 信息流源：Gut —— Gut 期刊最新发表论文（胃肠病学与肝脏病学）
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Gut（英国胃肠病学会期刊，BMJ 出版）
export default defineJournalSource("Gut", "https://gut.bmj.com/rss/current.xml")
