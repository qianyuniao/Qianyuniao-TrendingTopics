import { createContext, runInContext } from "node:vm"
import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { defineSource } from "./source"
import { myFetch } from "./fetch"

export interface PolicySourceConfig {
  /** 唯一 id，同时作为 source id（如 policy_gov） */
  id: string
  /** 部门展示名（用于卡片小标签与失败提示） */
  name: string
  /** 政策列表页地址 */
  url: string
  /** 每条政策所在元素选择器；留空则启用通用兜底（扫描全页 a 标签） */
  item?: string
  /** 标题选择器（相对 item）；留空则在 item 内找首个 a 的文本 */
  title?: string
  /** 链接选择器（相对 item）；留空则取标题内 / 首个 a 的 href */
  link?: string
  /** 发布日期选择器（相对 item），可选 */
  date?: string
  /**
   * item 选择器无匹配时的兜底取条策略：
   * - `dom`（默认）：按 DOM 顺序扫描全页链接，行为与原实现一致
   * - `container`：按列表容器聚合，自动挑「链接最密集且像内容列表」的容器，避开导航与机构名单
   */
  mode?: "dom" | "container"
  /**
   * 是否为国际机构来源：
   * - 默认 false：限定同域或 `*.gov.cn`，且标题需含中文（用于过滤 English Version 等外文导航）
   * - true：允许跨域链接，标题可为英文（国际统计机构站点多为跨域与英文）
   */
  intl?: boolean
  /** 备用列表页：主地址请求失败时自动改用它（应对部分站点间歇性不可达） */
  fallbackUrl?: string
  /** 最多保留条数，默认 30 */
  limit?: number
}

/**
 * 各部门官网最新政策源配置。
 * 新增一个职能部门只需在此数组追加一项：id / name / url 即可，
 * 选择器（item/title/link/date）留空会自动用兜底策略，也可按实际页面微调。
 */
export const policySources: PolicySourceConfig[] = [
  { id: "policy_gov", name: "国务院", url: "https://www.gov.cn/zhengce/", mode: "container" },
  { id: "policy_ndrc", name: "国家发展改革委", url: "https://www.ndrc.gov.cn/xxgk/zcfb/fzggwl/", item: "ul.u-list li:has(a[href*='t20'])", title: "a", link: "a" },
  { id: "policy_mof", name: "财政部", url: "http://www.mof.gov.cn/zhengwuxinxi/caizhengxinwen/", item: "li", title: "a" },
  { id: "policy_moe", name: "教育部", url: "http://www.moe.gov.cn/jyb_xxgk/xxgk_jyta/", item: "li", title: "a" },
  { id: "policy_most", name: "科技部", url: "https://www.most.gov.cn/kjbgz/", item: "li", title: "a" },
  { id: "policy_pbc", name: "中国人民银行", url: "http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/index.html", item: "li", title: "a" },
  { id: "policy_csrc", name: "证监会", url: "http://www.csrc.gov.cn/csrc/c100028/index.shtml", item: "li", title: "a" },
  { id: "policy_chinatax", name: "国家税务总局", url: "http://www.chinatax.gov.cn/", item: "li", title: "a" },
  { id: "policy_mohrss", name: "人力资源社会保障部", url: "http://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/gfxwj/", item: "li", title: "a", link: "a" },
  { id: "policy_miit", name: "工业和信息化部", url: "https://www.miit.gov.cn/", item: "li", title: "a" },
  // ===== 民生相关职能部门（国家统计局 + 医疗 / 民政 / 住房 / 三农 / 市场监管 / 生态 / 交通 等）=====
  { id: "policy_stats", name: "国家统计局", url: "https://www.stats.gov.cn/sj/zxfb/", item: ".list-content li", title: "a", link: "a", date: "span" },
  { id: "policy_nhsa", name: "国家医疗保障局", url: "https://www.nhsa.gov.cn/", item: "li", title: "a" },
  { id: "policy_mca", name: "民政部", url: "https://www.mca.gov.cn/n152/n165/index.html", mode: "container" },
  { id: "policy_mohurd", name: "住房和城乡建设部", url: "https://www.mohurd.gov.cn/", item: "li", title: "a" },
  { id: "policy_moa", name: "农业农村部", url: "https://www.moa.gov.cn/", item: "li", title: "a" },
  { id: "policy_samr", name: "国家市场监督管理总局", url: "https://www.samr.gov.cn/", item: "li", title: "a" },
  { id: "policy_mee", name: "生态环境部", url: "https://www.mee.gov.cn/", item: "li", title: "a" },
  { id: "policy_mot", name: "交通运输部", url: "https://www.mot.gov.cn/", item: "li", title: "a" },
  // ===== 国务院组成部门（其余）=====
  { id: "policy_mfa", name: "外交部", url: "https://www.mfa.gov.cn/web/ziliao_674904/zcwj_674915/", mode: "container" },
  { id: "policy_mod", name: "国防部", url: "http://www.mod.gov.cn/gfbw/fgwx/wj_213958/index.html", mode: "container" },
  { id: "policy_mnr", name: "自然资源部", url: "https://www.mnr.gov.cn/gk/zcjd/", mode: "container" },
  { id: "policy_mwr", name: "水利部", url: "http://www.mwr.gov.cn/", mode: "container" },
  { id: "policy_mofcom", name: "商务部", url: "https://www.mofcom.gov.cn/zwgk/zcfb/index.html", mode: "container" },
  { id: "policy_mct", name: "文化和旅游部", url: "https://www.mct.gov.cn/", mode: "container" },
  { id: "policy_mva", name: "退役军人事务部", url: "https://www.mva.gov.cn/", mode: "dom" },
  { id: "policy_mem", name: "应急管理部", url: "https://www.mem.gov.cn/", mode: "container" },
  { id: "policy_audit", name: "审计署", url: "https://www.audit.gov.cn/", mode: "dom" },
  // ===== 国务院直属机构 / 直属事业单位 =====
  { id: "policy_nrta", name: "国家广播电视总局", url: "https://www.nrta.gov.cn/", mode: "container" },
  { id: "policy_sport", name: "国家体育总局", url: "https://www.sport.gov.cn/", mode: "dom" },
  { id: "policy_forestry", name: "国家林业和草原局", url: "https://www.forestry.gov.cn/", mode: "container" },
  { id: "policy_cnipa", name: "国家知识产权局", url: "https://www.cnipa.gov.cn/", mode: "dom" },
  { id: "policy_natcm", name: "国家中医药管理局", url: "http://www.natcm.gov.cn/", mode: "dom" },
  { id: "policy_spb", name: "国家邮政局", url: "https://www.spb.gov.cn/gjyzj/c100009/c100010/common_list.shtml", mode: "container" },
  { id: "policy_cma", name: "中国气象局", url: "https://www.cma.gov.cn/", mode: "dom" },
  { id: "policy_lswz", name: "国家粮食和物资储备局", url: "https://www.lswz.gov.cn/", mode: "container" },
  { id: "policy_nea", name: "国家能源局", url: "https://www.nea.gov.cn/", mode: "container" },
  { id: "policy_safe", name: "国家外汇管理局", url: "https://www.safe.gov.cn/", mode: "container" },
  { id: "policy_cac", name: "中央网信办", url: "https://www.cac.gov.cn/", mode: "container" },
  { id: "policy_sasac", name: "国务院国资委", url: "http://www.sasac.gov.cn/", mode: "dom" },
  { id: "policy_sac", name: "国家标准委", url: "https://www.sac.gov.cn/", mode: "dom" },
  { id: "policy_nra", name: "国家铁路局", url: "https://www.nra.gov.cn/xwzx/", mode: "container" },
  // ===== 其他国家机关 =====
  { id: "policy_npc", name: "中国人大网", url: "http://www.npc.gov.cn/", mode: "container" },
  { id: "policy_cppcc", name: "中国政协网", url: "http://www.cppcc.gov.cn/zxxw/yw/", mode: "container" },
  { id: "policy_court", name: "最高人民法院", url: "https://www.court.gov.cn/", mode: "dom" },
  { id: "policy_spp", name: "最高人民检察院", url: "https://www.spp.gov.cn/spp/tzgg1/index.shtml", mode: "container" },
  { id: "policy_gwytb", name: "国务院台办", url: "http://www.gwytb.gov.cn/", mode: "dom" },
  { id: "policy_hmo", name: "国务院港澳办", url: "http://www.hmo.gov.cn/" },
  { id: "policy_cast", name: "中国科协", url: "https://www.cast.org.cn/", mode: "container" },
  { id: "policy_cdpf", name: "中国残联", url: "https://www.cdpf.org.cn/", mode: "container" },
  // 说明：公安部、司法部、国家卫生健康委、海关总署、金融监管总局、国家消防救援局、
  // 机关事务管理局等站点为纯前端渲染或网络不可达，服务端抓取只能拿到空页面，故暂未接入。
  // ===== 国家统计局「数据看板」专用数据栏目 =====
  { id: "stats_sjjd", name: "统计数据解读", url: "https://www.stats.gov.cn/sj/sjjd/", item: ".list-content li", title: "a", link: "a", date: "span" },
  { id: "stats_tjgb", name: "年度统计公报", url: "https://www.stats.gov.cn/sj/tjgb/ndtjgb/", item: ".list-content li", title: "a", link: "a", date: "span" },
  // ===== 其他官方数据统计平台（数据看板）=====
  { id: "stats_pbc", name: "金融统计数据报告", url: "http://www.pbc.gov.cn/diaochatongjisi/116219/116225/index.html", mode: "dom" },
  { id: "stats_pbc2", name: "金融统计调查", url: "http://www.pbc.gov.cn/diaochatongjisi/116219/116319/index.html", mode: "dom" },
  { id: "stats_mof", name: "财政收支情况", url: "http://www.mof.gov.cn/zhengwuxinxi/caizhengshuju/", mode: "dom" },
  // ===== 国际权威统计机构（数据看板）=====
  // 注：联合国新闻（news.un.org）对服务端进程启用了反爬，稳定返回 0 条，故只保留链接入口。
  { id: "intl_wb", name: "世界银行指标", url: "https://data.worldbank.org/indicator", mode: "container", intl: true },
]

function absUrl(href: string, base: string): string {
  if (!href) return ""
  try {
    return new URL(href, base).href
  } catch {
    return href
  }
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim()
}

/** 政府站点通用浏览器 UA（部分站点对默认 UA 返回空页或拦截） */
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

/** 是否为 JS 反爬挑战页（如人社部官网使用的 EdgeOne 挑战页） */
function isChallengePage(html: string): boolean {
  return html.includes("EO_Bot_Ssid") && html.includes("__tst_status")
}

/**
 * 在受限沙箱中执行挑战页内联脚本，推导出浏览器应携带的 cookie。
 * 仅注入 document / location / window / setTimeout，超时 1s，失败返回 undefined。
 */
function solveChallengeCookie(html: string, url: string): string | undefined {
  const code = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join("\n")
  if (!code) return
  const cookies: string[] = []
  const document: Record<string, unknown> = {}
  Object.defineProperty(document, "cookie", {
    get: () => cookies.join("; "),
    set: (v: string) => cookies.push(v),
  })
  const location = { href: url, replace() {} }
  try {
    runInContext(code, createContext({ document, location, window: { location }, setTimeout: () => 0 }), { timeout: 1000 })
  } catch {
    return
  }
  if (!cookies.length) return
  return cookies.map(c => c.replace(/;\s*$/, "")).join("; ")
}

/**
 * 按响应头 / meta 声明的字符集解码 HTML。
 * 不少政府站点仍是 GB2312 / GBK / GB18030（如国务院台办），按 UTF-8 解会整页乱码。
 */
function decodeHtml(buffer: ArrayBuffer, contentType?: string | null): string {
  const bytes = new Uint8Array(buffer)
  let charset = /charset=([\w-]+)/i.exec(contentType || "")?.[1]
  if (!charset) {
    const head = new TextDecoder("latin1").decode(bytes.subarray(0, 2048))
    charset = /charset=["']?([\w-]+)/i.exec(head)?.[1]
  }
  let cs = (charset || "utf-8").toLowerCase()
  if (/gb2312|gbk|gb18030/.test(cs)) cs = "gb18030"
  if (cs === "utf8") cs = "utf-8"
  try {
    return new TextDecoder(cs).decode(bytes)
  } catch {
    return new TextDecoder("utf-8").decode(bytes)
  }
}

/**
 * 抓取政府页面：按正确字符集解码；遇到 JS 反爬挑战时自动解出 cookie 后再请求一次。
 * 例：人力资源社会保障部官网对无有效 cookie 的请求会返回挑战页而非真实列表页。
 */
async function fetchGovernmentHtml(url: string): Promise<string> {
  const headers = { "User-Agent": BROWSER_UA, "Accept-Language": "zh-CN,zh;q=0.9" }
  const fetchOnce = async (extra?: Record<string, string>) => {
    let contentType = ""
    const buffer = await myFetch<ArrayBuffer, "arrayBuffer">(url, {
      responseType: "arrayBuffer",
      timeout: 20000,
      headers: extra ? { ...headers, ...extra } : headers,
      onResponse({ response }) {
        contentType = response.headers.get("content-type") || ""
      },
    })
    return decodeHtml(buffer, contentType)
  }

  const html = await fetchOnce()
  if (!isChallengePage(html)) return html
  // 挑战脚本的常量每次响应都会变化，故最多重解 3 次，避免偶发解出失效 cookie
  let current = html
  for (let i = 0; i < 3; i++) {
    const cookie = solveChallengeCookie(current, url)
    if (!cookie) break
    let next: string
    try {
      next = await fetchOnce({ Cookie: cookie, Referer: url })
    } catch {
      break
    }
    if (!isChallengePage(next)) return next
    current = next
  }
  return current
}

/**
 * 依次尝试主地址与备用地址，返回首个成功的页面。
 * 返回实际使用的地址，用于把页面内的相对链接解析成绝对链接。
 */
async function fetchWithFallback(config: PolicySourceConfig): Promise<{ html: string, pageUrl: string }> {
  const urls = [config.url, ...(config.fallbackUrl ? [config.fallbackUrl] : [])]
  let lastError: unknown
  for (const url of urls) {
    try {
      return { html: await fetchGovernmentHtml(url), pageUrl: url }
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

/** 链接形如「带日期/文章号」的深层地址，用于判断容器是否装的是内容列表 */
const CONTENT_URL_RE = /\/\d{4}[-/]?\d{2,4}\/|_art|\/art\/|content_\d|info\/\d|\/t\d{8}_|id=\d/i

/** 备案号 / 页脚版权等非内容链接 */
const FOOTER_RE = /ICP备|公网安备|网站标识码|版权所有|主办单位|承办单位|技术支持|网站地图|免责声明|无障碍浏览|旧版回顾|设为首页|加入收藏/

/**
 * 修正「同一段文字在标题里重复出现」的标题。
 * 某些站点的列表项把桌面版/移动版文案塞进同一文本节点，
 * 会拼出「xxx… xxx…」这种重复标题，这里在重复起点处截断。
 */
function unwrapRepeatedTitle(text: string): string {
  const head = text.slice(0, 12)
  if (head.length < 8) return text
  const index = text.indexOf(head, 1)
  if (index <= 0) return text
  return text.slice(0, index).trim()
}

/**
 * 通用政府政策抓取器：解析部门官网政策列表页，提取标题 / 链接 / 发布时间。
 * 给定 item 选择器匹配不到时，自动兜底扫描全页看起来像政策条目的 <a>
 * （文本长度 8-80、同域或 *.gov.cn），以适配不同部门官网结构差异。
 * 注：各站点 HTML 结构可能变动，选择器如需更精准可在此配置中补充。
 */
export function definePolicySource(config: PolicySourceConfig) {
  const limit = config.limit ?? 30
  return defineSource(async () => {
    const { html, pageUrl } = await fetchWithFallback(config)
    const $ = cheerio.load(html)
    const baseHost = new URL(pageUrl).hostname
    const items: NewsItem[] = []

    /**
     * 收集页面上所有「像条目」的链接：文本 8-80 字、同域或 *.gov.cn。
     * extracted 返回 null 表示该链接不合格。
     */
    const extract = ($a: ReturnType<typeof $>): NewsItem | null => {
      const href = $a.attr("href") ?? ""
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return null
      const text = unwrapRepeatedTitle(clean($a.text()))
      if (text.length < 8 || text.length > 80) return null
      if (FOOTER_RE.test(text)) return null
      // 过滤纯外文导航（如 English Version / Français / [ English ]）；国际源标题本身即英文，不做此限制
      if (!config.intl && (text.match(/[\u4E00-\u9FA5]/g) || []).length < 2) return null
      const resolved = absUrl(href, pageUrl)
      try {
        const u = new URL(resolved)
        if (u.protocol !== "http:" && u.protocol !== "https:") return null
        if (!config.intl && !(u.hostname === baseHost || u.hostname.endsWith(".gov.cn"))) return null
        // 部门站页脚常挂「中国政府网」通用链接，非本站内容
        if (u.hostname === "www.gov.cn" && baseHost !== "www.gov.cn") return null
      } catch {
        return null
      }
      return { id: resolved, title: text, url: resolved, extra: { info: config.name } }
    }

    /** 按 DOM 顺序扫描全页链接 */
    const collectByDom = (): NewsItem[] => {
      const all: NewsItem[] = []
      $("a").each((_, el) => {
        const item = extract($(el))
        if (item) all.push(item)
      })
      return all
    }

    /**
     * 容器聚合：把链接按其所在的最近 <ul>/<dl>/<ol> 分组，
     * 取「深层内容链接最多、其次条目最多」的容器，从而避开导航栏与机构名单。
     */
    const collectByContainer = (): NewsItem[] => {
      const groups = new Map<unknown, { n: number, deep: number, items: NewsItem[] }>()
      $("a").each((_, el) => {
        const $a = $(el)
        const item = extract($a)
        if (!item) return
        const $container = $a.closest("ul, dl, ol")
        const key = ($container.length ? $container.get(0) : $a.parent().get(0)) ?? $a.get(0)
        if (!key) return
        let group = groups.get(key)
        if (!group) {
          group = { n: 0, deep: 0, items: [] }
          groups.set(key, group)
        }
        group.n++
        if (CONTENT_URL_RE.test(item.url)) group.deep++
        group.items.push(item)
      })
      let best: { n: number, deep: number, items: NewsItem[] } | undefined
      for (const group of groups.values()) {
        if (group.n < 5) continue
        if (!best || group.deep * 1000 + group.n > best.deep * 1000 + best.n) best = group
      }
      return best && (best.deep >= 3 || best.n >= 8) ? best.items : []
    }

    if (config.item) {
      $(config.item).each((_, el) => {
        const $el = $(el)
        let title = config.title ? clean($el.find(config.title).first().text()) : ""
        let url = config.link ? $el.find(config.link).first().attr("href") ?? "" : ""
        if (!url) {
          const $a = config.title
            ? $el.find(config.title).first().find("a").first()
            : $el.find("a").first()
          url = $a.attr("href") ?? ""
          if (!title) title = clean($a.text())
        }
        const resolved = absUrl(url, pageUrl)
        const date = config.date ? clean($el.find(config.date).first().text()) : ""
        if (title && resolved) {
          items.push({
            id: resolved,
            title,
            url: resolved,
            pubDate: date || undefined,
            extra: { info: config.name },
          })
        }
      })
    }

    // 兜底：item 选择器无匹配时按配置策略取条目（默认 DOM 顺序，保持原有行为）
    if (!items.length) {
      const picked = config.mode === "container" ? collectByContainer() : collectByDom()
      items.push(...(picked.length ? picked : collectByContainer()))
    }

    const seen = new Set<string>()
    const seenTitles = new Set<string>()
    const deduped = items.filter((i) => {
      const title = clean(i.title ?? "")
      // 同一条目常因多个入口地址重复出现，这里同时按标题去重
      if (seen.has(i.url) || (title && seenTitles.has(title))) return false
      seen.add(i.url)
      if (title) seenTitles.add(title)
      return true
    })

    const top = deduped.slice(0, limit)
    if (!top.length) throw new Error(`无法获取 ${config.name} 政策`)
    return top
  })
}
