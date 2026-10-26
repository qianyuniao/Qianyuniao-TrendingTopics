/**
 * 信息流源：Nature Physics —— Nature 子刊 Nature Physics 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Physics", "https://www.nature.com/nphys.rss")
