/**
 * 信息流源：BMJ —— 英国医学期刊 BMJ 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("BMJ", "https://www.bmj.com/rss/recent.xml")
