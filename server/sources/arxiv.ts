/**
 * 信息流源：arXiv —— arXiv 预印本平台最新论文（AI/ML 与物理等学科）
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 *
 * 注：rss.arxiv.org 的 RSS 对数据中心 IP（如 Cloudflare Worker 出口）限流严重，
 * 改用官方 export.arxiv.org 的 Atom API（返回格式同为 feed，复用同一解析器）。
 */
import { defineJournalSource } from "../utils/journal"

function api(cat: string) {
  return `https://export.arxiv.org/api/query?search_query=cat:${cat}&sortBy=submittedDate&sortOrder=descending&max_results=50`
}

// arXiv 预印本：跨 AI/ML 与物理等学科分类聚合
export default defineJournalSource("arXiv", [
  api("cs.LG"),
  api("quant-ph"),
])
