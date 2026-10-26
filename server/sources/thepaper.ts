/**
 * 信息流源：澎湃新闻
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
interface Res {
  data: {
    hotNews: {
      contId: string
      name: string
      pubTimeLong: string
    }[]
  }
}

export default defineSource(async () => {
  const url = "https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar"
  const res: Res = await myFetch(url)
  return res.data.hotNews
    .map((k) => {
      return {
        id: k.contId,
        title: k.name,
        url: `https://www.thepaper.cn/newsDetail_forward_${k.contId}`,
        mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${k.contId}`,
      }
    })
})
