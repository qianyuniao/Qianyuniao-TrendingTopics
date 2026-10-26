/**
 * 全局 HTTP 客户端
 * 统一带上桌面版 UA（上游站点普遍按 UA 反爬）、10s 超时、3 次重试，
 * 各数据源直接调用 myFetch，无需各自处理请求细节
 */
import { $fetch } from "ofetch"

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
})
