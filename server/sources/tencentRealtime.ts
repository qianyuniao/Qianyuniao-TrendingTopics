/**
 * 信息流源：腾讯新闻
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import tencent from "./tencent"

// tencent.ts 的 default 是 { "tencent-hot": fn } 映射，取出具体抓取函数直接复用
export default (tencent as Record<string, any>)["tencent-hot"]
