import type { NewsItem } from "@shared/types"
import { XMLParser } from "fast-xml-parser"
import { defineSource } from "./source"
import { myFetch } from "./fetch"

/**
 * 学术期刊 / 预印本平台 RSS 解析与抓取工具。
 * 兼容 RSS 2.0 / RSS 1.0(RDF) / Atom：Nature、PNAS、NEJM 等为 RDF 格式，
 * 其 <item> 定义在 <rdf:RDF> 顶层（与 <channel> 平级），需单独处理。
 */
const parser = new XMLParser({
  attributeNamePrefix: "",
  textNodeName: "$text",
  ignoreAttributes: false,
})

function pickText(v: any): string {
  if (v == null) return ""
  // Atom 里同一字段可能出现多次（如多个 category），fast-xml-parser 会给出数组
  if (Array.isArray(v)) return pickText(v[0])
  if (typeof v === "string") return v
  if (typeof v === "object") return v.$text ?? v["#text"] ?? v.href ?? ""
  return String(v)
}

function pickLink(v: any): string {
  if (v == null) return ""
  // Atom 的 <link> 通常有 alternate / self 等多个，解析为数组，优先取 rel=alternate
  if (Array.isArray(v)) {
    const preferred = v.find((x: any) => x?.rel === "alternate")
    return pickLink(preferred ?? v[0])
  }
  if (typeof v === "string") return v
  if (typeof v === "object") return v.href ?? v.$text ?? v["#text"] ?? ""
  return String(v)
}

// 清理标题：去掉 HTML 标签、合并空白
function cleanText(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, m => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&apos;": "'", "&nbsp;": " " }[m.toLowerCase()] ?? m))
    .replace(/\s+/g, " ")
    .trim()
}

export function parseJournalFeed(xml: string, name: string, limit: number) {
  const doc = parser.parse(xml)
  const root = doc.rss ?? doc.feed ?? doc["rdf:RDF"] ?? doc
  const channel = root.channel ?? root
  let raw: any[] = channel.item ?? channel.entry ?? root.item ?? []
  if (!Array.isArray(raw)) raw = [raw]
  return raw.slice(0, limit).map((it: any): NewsItem => {
    const title = cleanText(pickText(it.title))
    const link = pickLink(it.link)
    const date = pickText(it.pubDate ?? it.updated ?? it["dc:date"] ?? it.created)
    const guid = it.guid?.$text ?? it.guid ?? it.id
    return {
      id: typeof guid === "string" ? guid : link,
      title,
      url: link,
      pubDate: date || undefined,
      extra: { info: name },
    }
  }).filter(i => i.title && i.url)
}

async function fetchJournalXml(url: string): Promise<string> {
  let lastErr: unknown
  // 单源重试，降低瞬时失败率
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // 显式以 UTF-8 解码，避免部分期刊源把 UTF-8 误当 Latin-1 产生乱码
      const buf = await myFetch(url, { responseType: "arrayBuffer", timeout: 20000 })
      if (buf) {
        const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer)
        return new TextDecoder("utf-8").decode(u8)
      }
    } catch (e) {
      lastErr = e
    }
    await new Promise(resolve => setTimeout(resolve, 800))
  }
  throw lastErr instanceof Error ? lastErr : new Error("fetch failed")
}

/**
 * 单期刊 / 单平台论文看板源。
 * @param name 展示名（用于卡片小标签）
 * @param urls 单个 RSS 地址或地址数组（如 arXiv 跨多个学科分类）
 * @param limit 最多展示条数
 */
export function defineJournalSource(name: string, urls: string | string[], limit = 50) {
  const list = Array.isArray(urls) ? urls : [urls]
  return defineSource(async () => {
    const all: any[] = []
    for (const u of list) {
      try {
        const xml = await fetchJournalXml(u)
        all.push(...parseJournalFeed(xml, name, limit))
      } catch {
        // 单源失败忽略，不影响整体
      }
    }

    // 按发布时间倒序
    all.sort((a: any, b: any) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0))

    // 按 url 去重
    const seen = new Set<string>()
    const deduped = all.filter((i: any) => {
      const key = i.url ?? String(i.id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const top = deduped.slice(0, limit)
    if (!top.length) throw new Error(`无法获取 ${name} 论文`)
    return top
  })
}

interface CrossrefItem {
  "DOI"?: string
  "title"?: string[]
  "container-title"?: string[]
  "created"?: { "date-parts"?: number[][] }
  "published"?: { "date-parts"?: number[][] }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

/**
 * 基于 Crossref 公开 API 的论文看板源（无需密钥）。
 * 很多出版社 / 数据库没有公开 RSS，但都是 Crossref 成员，可按 member 拉取最新论文。
 * @param name 展示名
 * @param member Crossref 成员 ID；传 null 表示不限出版商（用于跨学科索引库）
 * @param options 拉取选项
 * @param options.sort 排序字段：created（最新上线）或 is-referenced-by-count（高被引）
 * @param options.days 只取最近多少天内上线的论文
 * @param options.rows 拉取条数上限
 */
export function defineCrossrefSource(
  name: string,
  member: number | null,
  options: { sort?: "created" | "is-referenced-by-count", days?: number, rows?: number } = {},
) {
  const sort = options.sort ?? "created"
  const days = options.days ?? 60
  const rows = options.rows ?? 40
  return defineSource(async () => {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const filter = `${member ? `member:${member},` : ""}from-created-date:${from}`
    const url = `https://api.crossref.org/works?filter=${filter}&sort=${sort}&order=desc&rows=${rows}&select=DOI,title,created,published,container-title`
    const res = await myFetch<{ message?: { items?: CrossrefItem[] } }>(url, {
      // Crossref 要求 UA 带上联系地址，指向本项目仓库
      headers: { "User-Agent": `Qianyuniao-TrendingTopics/1.0 (${Homepage})` },
      timeout: 20000,
    })
    const items = res?.message?.items ?? []
    const mapped = items.map((it) => {
      const doi = it.DOI ?? ""
      const title = decodeEntities((it.title?.[0] ?? "").replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim()
      const journal = it["container-title"]?.[0] ?? ""
      const parts = ((it.created ?? it.published)?.["date-parts"]?.[0] ?? []).slice(0, 3)
      const pubDate = parts.length
        ? parts.map((n, i) => (i === 0 ? String(n) : String(n).padStart(2, "0"))).join("-")
        : undefined
      return {
        id: doi,
        title,
        url: doi ? `https://doi.org/${doi}` : "",
        pubDate,
        extra: { info: journal ? `${name} · ${journal}` : name },
      }
    }).filter(i => i.title && i.url)
    if (!mapped.length) throw new Error(`无法获取 ${name} 论文`)
    return mapped
  })
}
