/**
 * 信息流源：JAMA —— 美国医学会杂志 JAMA：临床医学与卫生政策顶级期刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// JAMA
export default defineJournalSource("JAMA", "https://jamanetwork.com/rss/site_3/67.xml")
