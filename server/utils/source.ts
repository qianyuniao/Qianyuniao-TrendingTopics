/**
 * 数据源定义工具
 * server/sources/*.ts 里的每个源都用这里的工厂函数声明，
 * 统一返回 `SourceGetter`（一个无参异步函数），由 registry 按 id 调度调用。
 */
import process from "node:process"
import type { AllSourceID } from "@shared/types"
import type { SourceGetter, SourceOption } from "#/types"

type R = Partial<Record<AllSourceID, SourceGetter>>

/**
 * 声明一个数据源，本身不做任何加工，仅用于获得类型约束：
 * 单源形式传一个函数，多源形式传 `Record<SourceID, SourceGetter>`（一个文件提供多个栏目）
 */
export function defineSource(source: SourceGetter): SourceGetter
export function defineSource(source: R): R
export function defineSource(source: SourceGetter | R): SourceGetter | R {
  return source
}

/** RSS / Atom 源：拉取并转成统一的 NewsItem 列表 */
export function defineRSSSource(url: string, option?: SourceOption): SourceGetter {
  return async () => {
    const data = await rss2json(url)
    if (!data?.items.length) throw new Error("Cannot fetch rss data")
    return data.items.map(item => ({
      title: item.title,
      url: item.link,
      id: item.link,
      pubDate: !option?.hiddenDate ? item.created : undefined,
    }))
  }
}

/**
 * 部署在 CF Pages 时的代理兜底
 * Cloudflare Pages 环境直连部分上游会被拦截，改为读取预先抓好的代理地址
 */
export function proxySource(proxyUrl: string, source: SourceGetter) {
  return process.env.CF_PAGES
    ? defineSource(async () => {
        const data = await myFetch(proxyUrl)
        return data.items
      })
    : source
}
