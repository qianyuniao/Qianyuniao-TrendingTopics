import type { HotboardItem } from "@shared/hotboard"
import { UA_MAC_CHROME, httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "游研社"
export const DESC = "游研社全部文章"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.yystv.cn/home/get_home_docs_by_page"
  const headers = {
    "User-Agent": UA_MAC_CHROME,
  }
  const text = await httpGetText(url, headers)
  const data: any = JSON.parse(text)
  const list: any[] = data?.data ?? []
  return list.map((item: any) => {
    const id = item.id ?? ""
    return {
      id,
      title: item.title,
      cover: item.cover,
      author: item.author,
      time: getTime(item.createtime),
      url: `https://www.yystv.cn/p/${id}`,
      mobile_url: `https://www.yystv.cn/p/${id}`,
    } as HotboardItem
  })
}
