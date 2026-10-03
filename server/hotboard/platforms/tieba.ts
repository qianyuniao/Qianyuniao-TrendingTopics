import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "百度贴吧"
export const DESC = "百度贴吧热议榜"

export async function fetch(): Promise<HotboardItem[]> {
  const url = "https://tieba.baidu.com/hottopic/browse/topicList"
  const result: any = await httpGet(url)
  const list: any[] = result?.data?.bang_topic?.topic_list ?? []
  return list.map((item: any) => {
    return {
      id: item.topic_id,
      title: item.topic_name,
      desc: item.topic_desc,
      cover: item.topic_pic,
      hot: item.discuss_num,
      time: getTime(item.create_time),
      url: item.topic_url,
      mobile_url: item.topic_url,
    } as HotboardItem
  })
}
