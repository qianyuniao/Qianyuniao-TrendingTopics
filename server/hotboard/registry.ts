import process from "node:process"
import type { HotboardItem, HotboardOption, HotboardPlatform, HotboardResponse } from "@shared/hotboard"
import { platforms } from "./platforms/index"

/**
 * Hotboard 注册表（Node 版，替代 Python hotboard.registry）
 * 平台模块在 ./platforms/index.ts 中显式注册，每个模块导出：
 *   PLATFORM_NAME: string
 *   DESC?: string
 *   options?: HotboardOption[]   // 参数（含 choices 子榜单选择）
 *   TYPES?: Record<string,string> // 子榜单值 -> 可读名
 *   fetch(params?): HotItem[] | Promise<HotItem[]>
 */

/** 平台模块的统一契约，各平台只需结构相符即可 */
interface HotboardPlatformModule {
  PLATFORM_NAME: string
  DESC?: string
  options?: HotboardOption[]
  TYPES?: Record<string, string>
  fetch: (params?: Record<string, any>) => HotboardItem[] | Promise<HotboardItem[]>
}

const TTL = Number(process.env.HOTBOARD_CACHE_TTL ?? 60) * 1000
const cache = new Map<string, { t: number, data: HotboardResponse }>()

function isPlatformModule(mod: unknown): mod is HotboardPlatformModule {
  const m = mod as Partial<HotboardPlatformModule> | null
  return !!m && typeof m.PLATFORM_NAME === "string" && typeof m.fetch === "function"
}

export function listPlatforms(): HotboardPlatform[] {
  const list: HotboardPlatform[] = []
  for (const [id, mod] of Object.entries(platforms)) {
    if (!isPlatformModule(mod)) continue
    // 先取出再兜底：直接写 mod.DESC ?? mod.PLATFORM_NAME 会被 TS 按字面量类型收窄成 never
    const desc: string | undefined = mod.DESC
    list.push({
      id,
      name: mod.PLATFORM_NAME,
      desc: desc ?? mod.PLATFORM_NAME,
      options: mod.options ?? [],
    })
  }
  return list.sort((a, b) => a.id.localeCompare(b.id))
}

/** 解析当前选中的子榜单值（用于 TYPES 映射） */
function selectedType(mod: any, params: Record<string, any>): string | undefined {
  const opt = (mod.options ?? []).find((o: HotboardOption) => o.choices && o.choices.length > 0)
  if (!opt) return undefined
  return params[opt.name] ?? opt.default ?? opt.choices?.[0]
}

export async function fetchPlatform(
  id: string,
  params: Record<string, any> = {},
): Promise<HotboardResponse> {
  const mod: any = (platforms as any)[id]
  if (!isPlatformModule(mod)) {
    throw new Error(`不支持的平台：${id}`)
  }

  const key = `${id}?${new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null) as [string, string][],
  ).toString()}`

  const hit = cache.get(key)
  if (hit && Date.now() - hit.t < TTL) {
    return hit.data
  }

  const result = await mod.fetch(params)
  const items = (result ?? []) as HotboardItem[]
  const typeValue = selectedType(mod, params)
  const type = (mod.TYPES?.[typeValue as string]) ?? null

  const data: HotboardResponse = {
    id,
    name: mod.PLATFORM_NAME,
    type,
    total: items.length,
    updatedTime: Date.now(),
    items,
  }

  cache.set(key, { t: Date.now(), data })
  return data
}
