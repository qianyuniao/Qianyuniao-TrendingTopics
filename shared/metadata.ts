import { sources } from "./sources"
import { typeSafeObjectEntries, typeSafeObjectFromEntries } from "./type.util"
import type { Color, ColumnID, Metadata, SourceID } from "./types"

/**
 * 栏目配色：卡片按所属栏目（分类）取色，让不同分类一眼可辨
 */
export const columnColors: Partial<Record<ColumnID, Color>> = {
  china: "red",
  world: "indigo",
  tech: "blue",
  finance: "amber",
  nature: "emerald",
  cell: "teal",
  pnas: "purple",
  nejm: "red",
  arxiv: "blue",
  science: "blue",
  sciadv: "sky",
  elife: "fuchsia",
  bmj: "rose",
  natcomm: "emerald",
  natmed: "red",
  natbiotech: "pink",
  natgen: "violet",
  natphys: "cyan",
  natchem: "amber",
  natmat: "lime",
  natneuro: "indigo",
  natclimate: "teal",
  natmethods: "orange",
  natmicrobiol: "rose",
  natplants: "green",
  natrevcancer: "red",
  natrevneuro: "violet",
  pubmed: "emerald",
  webofscience: "blue",
  sciencedirect: "orange",
  springerlink: "green",
  wiley: "red",
  // ===== 新增顶级期刊 / 预印本配色 =====
  jama: "red",
  lancet: "rose",
  neuron: "indigo",
  immunity: "sky",
  cancercell: "fuchsia",
  cellreports: "violet",
  natrevgen: "emerald",
  natrevdrug: "teal",
  biorxiv: "lime",
  medrxiv: "green",
  preprints: "amber",
  plosone: "orange",
  plosbio: "yellow",
  jmlr: "purple",
  ebsco: "teal",
  ieee: "cyan",
  iopscience: "violet",
  asce: "amber",
  reaxys: "fuchsia",
  sage: "rose",
  psycinfo: "indigo",
}

/**
 * 取源所属栏目的颜色，没有栏目配色时回退到源自身的品牌色
 */
export function colorOfSource(id: SourceID): Color {
  const column = sources[id]?.column as ColumnID | undefined
  const color = column ? columnColors[column] : undefined
  return color ?? sources[id]?.color ?? "primary"
}

export const columns = {
  china: {
    zh: "国内",
  },
  world: {
    zh: "国际",
  },
  tech: {
    zh: "科技",
  },
  finance: {
    zh: "财经",
  },
  nature: {
    zh: "Nature",
  },
  cell: {
    zh: "Cell",
  },
  pnas: {
    zh: "PNAS",
  },
  nejm: {
    zh: "NEJM",
  },
  arxiv: {
    zh: "arXiv",
  },
  science: { zh: "Science" },
  sciadv: { zh: "Science Advances" },
  elife: { zh: "eLife" },
  bmj: { zh: "BMJ" },
  natcomm: { zh: "Nature Communications" },
  natmed: { zh: "Nature Medicine" },
  natbiotech: { zh: "Nature Biotechnology" },
  natgen: { zh: "Nature Genetics" },
  natphys: { zh: "Nature Physics" },
  natchem: { zh: "Nature Chemistry" },
  natmat: { zh: "Nature Materials" },
  natneuro: { zh: "Nature Neuroscience" },
  natclimate: { zh: "Nature Climate Change" },
  natmethods: { zh: "Nature Methods" },
  natmicrobiol: { zh: "Nature Microbiology" },
  natplants: { zh: "Nature Plants" },
  natrevcancer: { zh: "Nature Reviews Cancer" },
  natrevneuro: { zh: "Nature Reviews Neuroscience" },
  pubmed: { zh: "PubMed" },
  webofscience: { zh: "Web of Science" },
  sciencedirect: { zh: "ScienceDirect" },
  springerlink: { zh: "SpringerLink" },
  wiley: { zh: "Wiley Online Library" },
  ebsco: { zh: "EBSCO" },
  ieee: { zh: "IEEE Xplore" },
  iopscience: { zh: "IOPscience" },
  asce: { zh: "ASCE Library" },
  reaxys: { zh: "Reaxys" },
  sage: { zh: "SAGE Journals" },
  psycinfo: { zh: "PsycINFO" },
  // ===== 新增顶级期刊 / 预印本 =====
  jama: { zh: "JAMA" },
  lancet: { zh: "The Lancet" },
  neuron: { zh: "Neuron" },
  immunity: { zh: "Immunity" },
  cancercell: { zh: "Cancer Cell" },
  cellreports: { zh: "Cell Reports" },
  natrevgen: { zh: "Nature Reviews Genetics" },
  natrevdrug: { zh: "Nature Reviews Drug Discovery" },
  biorxiv: { zh: "bioRxiv" },
  medrxiv: { zh: "medRxiv" },
  preprints: { zh: "Preprints.org" },
  plosone: { zh: "PLOS ONE" },
  plosbio: { zh: "PLOS Biology" },
  jmlr: { zh: "JMLR" },
  focus: {
    zh: "关注",
  },
  realtime: {
    zh: "实时",
  },
  hottest: {
    zh: "最热",
  },
} as const

export const fixedColumnIds = ["focus", "hottest", "realtime", "nature", "science", "cell", "pnas", "nejm", "arxiv", "sciadv", "elife", "bmj", "natcomm", "natmed", "natbiotech", "natgen", "natphys", "natchem", "natmat", "natneuro", "natclimate", "natmethods", "natmicrobiol", "natplants", "natrevcancer", "natrevneuro", "pubmed", "webofscience", "sciencedirect", "springerlink", "wiley", "ebsco", "ieee", "iopscience", "asce", "reaxys", "sage", "psycinfo", "jama", "lancet", "neuron", "immunity", "cancercell", "cellreports", "natrevgen", "natrevdrug", "biorxiv", "medrxiv", "preprints", "plosone", "plosbio", "jmlr"] as const satisfies Partial<ColumnID>[]
/** 顶刊广场包含的全部期刊 column（用于顶刊菜单高亮与广场页渲染） */
export const journalColumnIds = ["nature", "science", "cell", "pnas", "nejm", "arxiv", "sciadv", "elife", "bmj", "natcomm", "natmed", "natbiotech", "natgen", "natphys", "natchem", "natmat", "natneuro", "natclimate", "natmethods", "natmicrobiol", "natplants", "natrevcancer", "natrevneuro", "pubmed", "webofscience", "sciencedirect", "springerlink", "wiley", "ebsco", "ieee", "iopscience", "asce", "reaxys", "sage", "psycinfo", "jama", "lancet", "neuron", "immunity", "cancercell", "cellreports", "natrevgen", "natrevdrug", "biorxiv", "medrxiv", "preprints", "plosone", "plosbio", "jmlr"] as const satisfies ColumnID[]
export const journalSet = new Set<string>(journalColumnIds)

/** 政策广场包含的全部职能部门政策源 id（用于政策菜单高亮与广场页渲染） */
export const policyColumnIds = [
  // 国务院 + 组成部门
  "policy_gov",
  "policy_ndrc",
  "policy_mof",
  "policy_moe",
  "policy_most",
  "policy_miit",
  "policy_mfa",
  "policy_mod",
  "policy_mnr",
  "policy_mwr",
  "policy_mofcom",
  "policy_mct",
  "policy_mva",
  "policy_mem",
  "policy_audit",
  "policy_mohrss",
  "policy_mca",
  "policy_mohurd",
  "policy_mee",
  "policy_mot",
  "policy_moa",
  // 金融 / 财税 / 监管
  "policy_pbc",
  "policy_csrc",
  "policy_chinatax",
  "policy_safe",
  // 民生与公共服务
  "policy_nhsa",
  "policy_stats",
  "policy_samr",
  "policy_cnipa",
  "policy_natcm",
  "policy_sport",
  "policy_cma",
  "policy_lswz",
  "policy_nea",
  "policy_forestry",
  "policy_cdpf",
  // 基础设施与行业监管
  "policy_nrta",
  "policy_cac",
  "policy_spb",
  "policy_nra",
  "policy_sasac",
  "policy_sac",
  // 其他国家机关
  "policy_npc",
  "policy_cppcc",
  "policy_court",
  "policy_spp",
  "policy_gwytb",
  "policy_hmo",
  "policy_cast",
] as const satisfies SourceID[]
export const policySet = new Set<string>(policyColumnIds)

/** 统计数据看板展示的数据栏目 id（国内官方平台 + 国际权威统计机构） */
export const statsColumnIds = [
  "policy_stats",
  "stats_sjjd",
  "stats_tjgb",
  "stats_pbc",
  "stats_pbc2",
  "stats_mof",
  "intl_wb",
] as const satisfies SourceID[]
export const statsSet = new Set<string>(statsColumnIds)

export const metadata: Metadata = typeSafeObjectFromEntries(typeSafeObjectEntries(columns).map(([k, v]) => {
  switch (k) {
    case "focus":
      return [k, {
        name: v.zh,
        sources: [] as SourceID[],
      }]
    case "hottest":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "hottest" && !v.redirect).map(([k]) => k),
      }]
    case "realtime":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "realtime" && !v.redirect).map(([k]) => k),
      }]
    default:
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.column === k && !v.redirect).map(([k]) => k),
      }]
  }
}))
