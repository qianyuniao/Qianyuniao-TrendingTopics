import { fetchPlatform } from "../../hotboard/registry"

/**
 * GET /api/hotboard/:platform 指定平台的热榜数据
 * 数据由 server/hotboard/registry 直接拉取；query 参数会透传给平台（如 ?type=hot 选子榜单），
 * 结果带 60 秒公共缓存
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "platform")
  if (!id || !/^[\w-]+$/.test(id)) {
    throw createError({ statusCode: 400, message: "Invalid platform id" })
  }

  const query = getQuery(event)
  const params: Record<string, any> = {}
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) {
      params[k] = Array.isArray(v) ? v[0] : v
    }
  }

  try {
    const response = await fetchPlatform(id, params)
    setHeader(event, "cache-control", "public, max-age=60")
    return response
  } catch (e: any) {
    throw createError({
      statusCode: 502,
      message: e?.message ?? "Hotboard 获取失败",
    })
  }
})
