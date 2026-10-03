import bilibili from "./bilibili"

// bilibili.ts 的 default 是 { "bilibili": fn, "bilibili-hot-search": fn, ... } 映射，取出热搜函数复用
export default (bilibili as Record<string, any>)["bilibili-hot-search"]
