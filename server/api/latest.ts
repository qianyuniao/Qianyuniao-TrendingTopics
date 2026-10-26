/**
 * GET /api/latest —— 返回服务端版本号
 * 前端据此提示用户「有新版本可刷新」
 */
export default defineEventHandler(async () => {
  return {
    v: Version,
  }
})
