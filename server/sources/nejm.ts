/**
 * 信息流源：NEJM —— New England Journal of Medicine 最新发表论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("NEJM", "https://www.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm")
