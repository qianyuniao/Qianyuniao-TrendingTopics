/**
 * CORS 中间件：允许主站（qianyuniao.pages.dev 等）跨域读取看板数据
 * 只放行只读接口，预检请求直接返回 204
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith("/api")) return
  setHeader(event, "Access-Control-Allow-Origin", "*")
  setHeader(event, "Access-Control-Allow-Methods", "GET,OPTIONS")
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type, Authorization")
  // 预检结果缓存时长（秒），数字类型；Access-Control-Max-Age 仅接受整数
  setHeader(event, "Access-Control-Max-Age", 86400)
  if (getMethod(event) === "OPTIONS") {
    setResponseStatus(event, 204)
    return ""
  }
})
