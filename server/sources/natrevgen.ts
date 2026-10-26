/**
 * 信息流源：Nature Reviews Genetics —— Nature Reviews：遗传学权威综述
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Nature Reviews Genetics
export default defineJournalSource("Nature Reviews Genetics", "https://www.nature.com/nrg.rss")
