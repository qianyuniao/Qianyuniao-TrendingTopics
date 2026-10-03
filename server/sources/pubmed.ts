import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

interface ESearchResult {
  esearchresult?: { idlist?: string[] }
}
interface ESummaryResult {
  result?: Record<string, {
    title?: string
    pubdate?: string
    fulljournalname?: string
    source?: string
  }>
}

// PubMed 没有统一 RSS，但提供 E-utilities：
// 1) esearch 取近 30 天、按日期排序的最新 PMID；
// 2) esummary 批量取标题 / 期刊 / 日期，组装成最新论文列表。
export default defineSource(async () => {
  const tool = "Qianyuniao"
  const search = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&sort=date&datetype=pdat&reldate=30&retmode=json&retmax=30&tool=${tool}`
  const sres = await myFetch<ESearchResult>(search)
  const ids = sres?.esearchresult?.idlist ?? []
  if (!ids.length) throw new Error("PubMed 暂无最新论文")

  const summary = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}&tool=${tool}`
  const mres = await myFetch<ESummaryResult>(summary)
  const result = mres?.result ?? {}

  const items = ids.map((id) => {
    const r = result[id] ?? {}
    const journal = r.fulljournalname ?? r.source ?? ""
    return {
      id,
      title: r.title ?? "",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      pubDate: r.pubdate ?? undefined,
      extra: { info: journal ? `PubMed · ${journal}` : "PubMed" },
    }
  }).filter(i => i.title)

  if (!items.length) throw new Error("PubMed 解析失败")
  return items
})
