import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "斗鱼直播"
export const DESC = "斗鱼直播热门直播间"

/**
 * 斗鱼分类混合列表接口（免鉴权，按热度排序）
 * 路径 mixList/2_1/{page}：2=全部分类、1=按热度排序
 */
export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const page = Math.max(1, Number(params?.page ?? 1) || 1)
  const url = `https://www.douyu.com/gapi/rkc/directory/mixList/2_1/${page}`
  const res: any = await httpGet(url, {
    "Referer": "https://www.douyu.com/",
    "User-Agent": UA_WIN_CHROME,
  })

  const list: any[] = res?.data?.rl ?? []
  return list
    .filter(item => !!item?.rn)
    .map((item) => {
      const rid = item.rid ?? null
      // 头像形如 avatar_v3/202009/xxxx.jpg，拼上 CDN 前缀即可直接访问
      const cover = item.av ? `https://apic.douyucdn.cn/upload/${item.av}.jpg` : null
      return {
        id: rid ?? item.rn,
        title: item.rn,
        desc: item.c2name ?? null,
        author: item.nn ?? null,
        cover,
        hot: item.ol ?? null,
        url: rid ? `https://www.douyu.com/${rid}` : null,
        mobile_url: rid ? `https://m.douyu.com/${rid}` : null,
      } as HotboardItem
    })
}
