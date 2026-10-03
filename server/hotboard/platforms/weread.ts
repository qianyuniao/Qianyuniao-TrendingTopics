import md5 from "md5"
import type { HotboardItem } from "@shared/hotboard"
import { httpGet } from "../http"
import { getTime } from "../time"

export const PLATFORM_NAME = "微信读书"
export const DESC = "微信读书排行榜"
export const options = [
  {
    name: "type",
    default: "rising",
    choices: ["rising", "hot_search", "newbook", "general_novel_rising", "all"],
    help: "排行榜类型",
  },
]
export const TYPES: Record<string, string> = {
  rising: "飙升榜",
  hot_search: "热搜榜",
  newbook: "新书榜",
  general_novel_rising: "小说榜",
  all: "总榜",
}

function getWereadId(bookId: string): string {
  const strHash = md5(bookId)
  let strSub = strHash.slice(0, 3)
  let fa: [string, string[]]
  if (/^\d+$/.test(bookId)) {
    const chunks: string[] = []
    for (let i = 0; i < bookId.length; i += 9) {
      chunks.push(Number.parseInt(bookId.slice(i, i + 9), 10).toString(16))
    }
    fa = ["3", chunks]
  } else {
    let hexStr = ""
    for (const char of bookId) {
      hexStr += char.codePointAt(0)!.toString(16)
    }
    fa = ["4", [hexStr]]
  }
  strSub += `${fa[0]}2${strHash.slice(-2)}`
  for (let i = 0; i < fa[1].length; i++) {
    const sub = fa[1][i]
    strSub += (sub.length).toString(16).padStart(2, "0") + sub
    if (i < fa[1].length - 1) {
      strSub += "g"
    }
  }
  if (strSub.length < 20) {
    strSub += strHash.slice(0, 20 - strSub.length)
  }
  strSub += md5(strSub).slice(0, 3)
  return strSub
}

export async function fetch(params?: Record<string, any>): Promise<HotboardItem[]> {
  const type = params?.type ?? "rising"
  const url = `https://weread.qq.com/web/bookListInCategory/${type}?rank=1`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
  }
  const result: any = await httpGet(url, headers)
  const books: any[] = result?.books ?? []
  return books.map((bookItem: any) => {
    const info = bookItem.bookInfo ?? {}
    const bookId = info.bookId ?? ""
    const wereadId = getWereadId(bookId)
    return {
      id: bookId,
      title: info.title,
      desc: info.intro,
      cover: (info.cover ?? "").replace("s_", "t9_"),
      author: info.author,
      hot: bookItem.readingCount,
      time: getTime(info.publishTime),
      url: `https://weread.qq.com/web/bookDetail/${wereadId}`,
      mobile_url: `https://weread.qq.com/web/bookDetail/${wereadId}`,
    } as HotboardItem
  })
}
