/**
 * 信息流源：Nature Reviews Drug Discovery —— Nature Reviews：药物发现权威综述
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Nature Reviews Drug Discovery
export default defineJournalSource("Nature Reviews Drug Discovery", "https://www.nature.com/nrd.rss")
