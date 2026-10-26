/**
 * 信息流源：Science Advances —— Science 子刊 Science Advances 最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

export default defineJournalSource("Science Advances", "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciadv")
