/**
 * 信息流源：PNAS —— Proceedings of the National Academy of Sciences 最新发表论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("PNAS", "https://www.pnas.org/rss/current.xml")
