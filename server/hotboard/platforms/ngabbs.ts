import type { HotboardItem } from "@shared/hotboard"
import { httpPostText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "NGA"
export const DESC = "NGA 论坛热帖"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://ngabbs.com/nuke.php?__lib=load_topic&__act=load_topic_reply_ladder2&opt=1&all=1"
  const headers = {
    "Accept": "*/*",
    "Host": "ngabbs.com",
    "Referer": "https://ngabbs.com/",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)",
  }
  const text = await httpPostText(url, "__output=14", headers)
  const data: any = JSON.parse(text)
  const resultList: any[] = data?.result ?? [[]]
  const itemList: any[] = resultList[0] ?? []
  return itemList.map((item: any) => {
    const tpcurl = item.tpcurl ?? ""
    return {
      id: item.tid,
      title: item.subject,
      author: item.author,
      hot: item.replies,
      time: getTime(item.postdate),
      url: `https://bbs.nga.cn${tpcurl}`,
      mobile_url: `https://bbs.nga.cn${tpcurl}`,
    } as HotboardItem
  })
}
