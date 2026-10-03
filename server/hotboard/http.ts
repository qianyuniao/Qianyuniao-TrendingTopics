import { Buffer } from "node:buffer"
import { ofetch } from "ofetch"
import iconv from "iconv-lite"

/**
 * HTTP 工具：替代 Python hotboard.utils 的 aiohttp 封装
 * - httpGet / httpPost：请求 JSON 接口并解析
 * - httpGetText / httpPostText：请求文本 / HTML（按需指定编码，默认 utf-8）
 * 代理：Node 24 原生支持读取 HTTPS_PROXY / HTTP_PROXY
 * （`--use-env-proxy` 或 `NODE_USE_ENV_PROXY=1`，dev 脚本已配置），无需额外依赖
 */

/** 请求超时（毫秒） */
const TIMEOUT = 15000

/**
 * 常用 User-Agent：上游站点普遍按 UA 反爬，同一串 UA 在多个平台复用，
 * 统一放在这里避免各平台文件各自硬编码
 */
export const UA_WIN_CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
export const UA_MAC_CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
export const UA_ANDROID_CHROME = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"

interface RequestOptions {
  method?: "GET" | "POST"
  headers?: Record<string, string>
  body?: any
  /** 返回文本时需指定上游编码（如 gbk） */
  encoding?: string
  text?: boolean
}

/** 所有请求的唯一出口：统一超时、不重试、按 text 决定是否解码成字符串 */
async function request(url: string, options: RequestOptions = {}): Promise<any> {
  const {
    method = "GET",
    headers,
    body,
    encoding = "utf-8",
    text = false,
  } = options

  const raw = await ofetch(url, {
    method,
    headers,
    body,
    retry: 0,
    timeout: TIMEOUT,
    responseType: text ? "arrayBuffer" : "json",
  })

  return text ? iconv.decode(Buffer.from(raw as ArrayBuffer), encoding) : raw
}

/** GET JSON */
export function httpGet(url: string, headers?: Record<string, string>): Promise<any> {
  return request(url, { headers })
}

/** GET 文本 / HTML，`encoding` 用于 gbk 等上游编码 */
export function httpGetText(
  url: string,
  headers?: Record<string, string>,
  encoding = "utf-8",
): Promise<string> {
  return request(url, { headers, encoding, text: true })
}

/** POST JSON（用于 36 氪网关等接口） */
export function httpPost(
  url: string,
  json: any,
  headers?: Record<string, string>,
): Promise<any> {
  return request(url, { method: "POST", headers, body: json })
}

/** POST 原始字符串 body（如表单体），返回文本（用于 NGA 等） */
export function httpPostText(
  url: string,
  body: string,
  headers?: Record<string, string>,
  encoding = "utf-8",
): Promise<string> {
  return request(url, { method: "POST", headers, body, encoding, text: true })
}
