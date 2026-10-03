import tencent from "./tencent"

// tencent.ts 的 default 是 { "tencent-hot": fn } 映射，取出具体抓取函数直接复用
export default (tencent as Record<string, any>)["tencent-hot"]
