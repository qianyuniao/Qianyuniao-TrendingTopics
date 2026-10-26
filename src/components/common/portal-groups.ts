import { sources } from "@shared/sources"

/** 单个官网入口 */
export interface PortalLinkItem {
  label: string
  href: string
}

/** 一组官网入口（如「短视频平台官网」） */
export interface PortalLinkGroup {
  label: string
  links: PortalLinkItem[]
}

/**
 * 依据 source id 列表生成「官网」分组，自动跳过没有官网地址的源
 *
 * 单独抽离为无组件依赖的工具模块，既能被各广场路由复用，
 * 也避免与 `PortalLinks` 组件同文件导出而触发 react-refresh 告警。
 */
export function portalGroupsOf(label: string, ids: readonly string[], limit?: number): PortalLinkGroup[] {
  const links = ids
    .map(id => sources[id as keyof typeof sources] as { name?: string, home?: string } | undefined)
    .filter((s): s is { name: string, home: string } => !!s?.home && !!s.name)
    .map(s => ({ label: s.name, href: s.home }))
    .slice(0, limit ?? Number.POSITIVE_INFINITY)
  return links.length ? [{ label, links }] : []
}
