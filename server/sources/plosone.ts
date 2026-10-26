/**
 * 信息流源：PLOS ONE —— PLOS ONE：开放获取综合性期刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// PLOS ONE
export default defineJournalSource("PLOS ONE", "https://journals.plos.org/plosone/feed/atom")
