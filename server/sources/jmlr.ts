/**
 * 信息流源：JMLR —— Journal of Machine Learning Research：机器学习顶刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// JMLR
export default defineJournalSource("JMLR", "https://www.jmlr.org/jmlr.xml")
