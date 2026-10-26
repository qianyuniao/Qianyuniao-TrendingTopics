import type { HotboardItem } from "@shared/hotboard"
import { toHttps } from "../html"
import { UA_WIN_CHROME, httpGet } from "../http"

export const PLATFORM_NAME = "虎牙直播"
export const DESC = "虎牙直播热门直播间"

/** 虎牙直播列表接口（免鉴权，按人气返回热门直播间，每页 120 条） */
export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const page = Math.max(1, Number(params?.page ?? 1) || 1)
  const url = `https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=0&tagAll=0&page=${page}`
  const res: any = await httpGet(url, {
    "Referer": "https://www.huya.com/",
    "User-Agent": UA_WIN_CHROME,
  })

  const list: any[] = res?.data?.datas ?? []
  return list
    // 部分直播间标题在 introduction（房间公告）里，roomName 为空
    .filter(item => !!(item?.roomName || item?.introduction))
    .map((item) => {
      const roomId = item.profileRoom ?? item.roomID ?? item.liveRoom ?? null
      const title = (item.roomName || item.introduction || "").trim()
      return {
        id: roomId ?? title,
        title,
        // 直播间分区（英雄联盟 / 颜值等）放在描述位
        desc: item.gameFullName ?? null,
        author: item.nick ?? null,
        cover: toHttps(item.screenshot ?? null),
        hot: item.totalCount ?? null,
        url: roomId ? `https://www.huya.com/${roomId}` : null,
      } as HotboardItem
    })
    .filter(item => !!item.title)
}
