/**
 * 信息流源：medRxiv —— 医学预印本平台最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// medRxiv
export default defineJournalSource("medRxiv", "https://connect.medrxiv.org/medrxiv_xml.php?subject=all")
