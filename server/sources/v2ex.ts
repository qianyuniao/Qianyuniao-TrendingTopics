/**
 * 信息流源：V2EX
 * www.v2ex.com 直连超时，改走 uapis 聚合的热门主题
 */
import type { NewsItem } from "@shared/types"

const share = defineSource(async () => {
  const res: any = await myFetch("https://uapis.cn/api/v1/misc/hotboard?type=v2ex")
  const list: any[] = res?.data?.list ?? res?.list ?? []
  return list.map((item: any): NewsItem => {
    return {
      id: item.extra?.id ?? item.url,
      title: item.title,
      url: item.url,
      extra: {
        info: item.hot_value || undefined,
      },
    }
  })
})

export default defineSource({
  "v2ex": share,
  "v2ex-share": share,
})
