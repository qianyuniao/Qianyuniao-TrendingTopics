/**
 * 信息流源：哔哩哔哩
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import bilibili from "./bilibili"

// bilibili.ts 的 default 是 { "bilibili": fn, "bilibili-hot-search": fn, ... } 映射，取出热搜函数复用
export default (bilibili as Record<string, any>)["bilibili-hot-search"]
