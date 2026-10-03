import { listPlatforms } from "../../hotboard/registry"

/**
 * GET /api/hotboard 平台列表
 * 数据由 server/hotboard/registry 直接提供
 */
export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "public, max-age=60")
  return listPlatforms()
})
