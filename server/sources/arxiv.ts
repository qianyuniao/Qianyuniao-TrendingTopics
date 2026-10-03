import { defineJournalSource } from "../utils/journal"

// arXiv 预印本：跨 AI/ML 与物理等学科分类聚合
export default defineJournalSource("arXiv", [
  "https://rss.arxiv.org/rss/cs.LG",
  "https://rss.arxiv.org/rss/quant-ph",
])
