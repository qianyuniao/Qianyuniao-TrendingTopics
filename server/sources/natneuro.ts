/**
 * 信息流源：Nature Neuroscience —— Nature 子刊 Nature Neuroscience 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Neuroscience", "https://www.nature.com/neuro.rss")
