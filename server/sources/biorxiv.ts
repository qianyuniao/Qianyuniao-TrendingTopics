/**
 * 信息流源：bioRxiv —— 生物学预印本平台最新论文
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// bioRxiv
export default defineJournalSource("bioRxiv", "https://connect.biorxiv.org/biorxiv_xml.php?subject=all")
