/**
 * 信息流源：Nature Microbiology —— Nature 子刊 Nature Microbiology 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Microbiology", "https://www.nature.com/nmicrobiol.rss")
