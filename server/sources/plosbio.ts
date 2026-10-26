/**
 * 信息流源：PLOS Biology —— PLOS Biology：开放获取生命科学期刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// PLOS Biology
export default defineJournalSource("PLOS Biology", "https://journals.plos.org/plosbiology/feed/atom")
