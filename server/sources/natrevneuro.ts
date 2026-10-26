/**
 * 信息流源：Nature Reviews Neuroscience —— Nature Reviews 系列 Nature Reviews Neuroscience 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Reviews Neuroscience", "https://www.nature.com/nrn.rss")
