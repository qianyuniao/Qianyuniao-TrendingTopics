import { sources } from "@shared/sources"

export interface PortalLinkItem {
  label: string
  href: string
}

export interface PortalLinkGroup {
  /** 分组标题，如「短视频平台官网」 */
  label: string
  links: PortalLinkItem[]
}

interface GradientStyle {
  backgroundImage: string
  WebkitBackgroundClip: "text"
  backgroundClip: "text"
  color: "transparent"
}

/** 渐变文字样式：色值由调用方传入，避免 UnoCSS 动态拼接类名被漏扫导致丢样式 */
function gradientText(from: string, to: string): GradientStyle {
  return {
    backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  }
}

/**
 * 渐变样式的官网导航标签
 * 渐变色由调用方以 hex 传入（from / to），避免 UnoCSS 动态拼接类名被漏扫导致丢样式
 */
export function PortalLinks({ groups, from, to }: {
  groups: PortalLinkGroup[]
  from: string
  to: string
}) {
  const pill = {
    backgroundImage: `linear-gradient(135deg, ${from}26, ${to}26)`,
  }
  return (
    <>
      {groups.map(group => (
        <span key={group.label} className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold" style={gradientText(from, to)}>
            {group.label}
          </span>
          {group.links.map(l => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              title={l.href}
              className="rounded-full px-2.5 py-0.5 text-xs transition-all duration-300 border border-white/10 hover:(border-white/30 shadow-lg)"
              style={pill}
            >
              <span className="font-medium" style={gradientText(from, to)}>
                {l.label}
              </span>
            </a>
          ))}
        </span>
      ))}
    </>
  )
}

/** 依据 source id 列表生成「官网」分组，自动跳过没有官网地址的源 */
export function portalGroupsOf(label: string, ids: readonly string[], limit?: number): PortalLinkGroup[] {
  const links = ids
    .map(id => sources[id as keyof typeof sources] as { name?: string, home?: string } | undefined)
    .filter((s): s is { name: string, home: string } => !!s?.home && !!s.name)
    .map(s => ({ label: s.name, href: s.home }))
    .slice(0, limit ?? Number.POSITIVE_INFINITY)
  return links.length ? [{ label, links }] : []
}
