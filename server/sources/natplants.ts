/**
 * 信息流源：Nature Plants —— Nature 子刊 Nature Plants 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Nature Plants", "https://www.nature.com/nplants.rss")
