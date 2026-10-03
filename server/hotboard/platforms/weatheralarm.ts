import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"

export const PLATFORM_NAME = "中央气象台"
export const DESC = "中央气象台气象预警"
export const options = [
  { name: "province", default: "", help: "预警区域（省份名称，例如：广东省）" },
]

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const province = params?.province ?? ""
  const url = `http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province=${encodeURIComponent(province)}`
  const data: any = await httpGet(url)
  const alarmList: any[] = data?.data?.page?.list ?? []
  return alarmList.map((item: any) => {
    const issueTime = item.issuetime ?? ""
    const title = item.title ?? ""
    return {
      id: item.alertid,
      title,
      desc: issueTime ? `${issueTime} ${title}` : title,
      cover: item.pic,
      time: issueTime,
      url: `http://nmc.cn${item.url}`,
      mobile_url: `http://nmc.cn${item.url}`,
    } as HotboardItem
  })
}
