import type { HotboardItem } from "@shared/hotboard"
import { UA_WIN_CHROME, httpGetText } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "抖音"
export const DESC = "抖音热榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1"
  const headers = {
    "User-Agent": UA_WIN_CHROME,
    "Referer": "https://www.douyin.com/",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  }
  const text = await httpGetText(url, headers)
  const result = JSON.parse(text)
  const list: any[] = result?.data?.word_list ?? []
  return list.map((item: any) => ({
    id: item.sentence_id,
    title: item.word,
    time: getTime(item.event_time),
    hot: item.hot_value,
    url: `https://www.douyin.com/hot/${item.sentence_id}`,
    mobile_url: `https://www.douyin.com/hot/${item.sentence_id}`,
  } as HotboardItem))
}
