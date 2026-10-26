/**
 * 信息流源：Nature Biotechnology —— Nature 子刊 Nature Biotechnology 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Biotechnology", "https://www.nature.com/nbt.rss")
