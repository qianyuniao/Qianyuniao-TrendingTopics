import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "爱范儿"
export const DESC = "爱范儿快讯"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://sso.ifanr.com/api/v5/wp/buzz/?limit=20&offset=0"
  const result: any = await httpGet(url)
  const list: any[] = result?.objects ?? []
  return list.map((item: any) => {
    const postId = item.post_id
    const url2 = `https://www.ifanr.com/digest/${postId}`
    const buzz = item.buzz_original_url
    const desc = buzz ? `${item.post_content}\n原文链接：${buzz}` : item.post_content
    const hot = item.like_count || item.comment_count
    return {
      id: item.id,
      title: item.post_title,
      desc,
      time: getTime(item.created_at),
      hot,
      url: url2,
      mobile_url: url2,
    } as HotboardItem
  })
}
