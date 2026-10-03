import { defineCrossrefSource } from "../utils/journal"

// EBSCO（Academic Search Complete）为跨学科聚合库（无自身论文），
// 用 Crossref 按「全学科最新上线」呈现。
export default defineCrossrefSource("EBSCO", null, { sort: "created", days: 14 })
