/**
 * 信息流源：Cell —— Cell 期刊最新发表论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Cell", "https://feeds.feedburner.com/cell")
