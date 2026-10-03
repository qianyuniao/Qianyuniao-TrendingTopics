import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "米游社"
export const DESC = "米游社游戏公告/活动/资讯"
export const options = [
  { name: "game", default: "2", choices: ["1", "2", "3", "4", "5", "6", "8"], help: "游戏类型" },
  { name: "type", default: "3", choices: ["1", "2", "3"], help: "内容类型" },
]
export const TYPES: Record<string, string> = {
  1: "崩坏 3",
  2: "原神",
  3: "崩坏学园 2",
  4: "未定事件簿",
  5: "大别野",
  6: "崩坏：星穹铁道",
  8: "绝区零",
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const game = params?.game ?? "2"
  const type = params?.type ?? "3"
  const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=${game}&last_id=&page_size=30&type=${type}`
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.list ?? []
  return list.map((item: any) => {
    const post = item.post ?? {}
    const postId = post.post_id ?? ""
    const images: any[] = post.images ?? []
    return {
      id: postId,
      title: post.subject,
      desc: post.content,
      cover: post.cover || (images.length ? images[0] : null),
      time: getTime(post.created_at),
      url: `https://www.miyoushe.com/ys/article/${postId}`,
      mobile_url: `https://m.miyoushe.com/ys/#/article/${postId}`,
    } as HotboardItem
  })
}
