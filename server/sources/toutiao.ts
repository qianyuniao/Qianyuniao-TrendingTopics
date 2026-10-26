/**
 * 信息流源：今日头条
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
interface Res {
  data: {
    ClusterIdStr: string
    Title: string
    HotValue: string
    Image: {
      url: string
    }
    LabelUri?: {
      url: string
    }
  }[]
}

export default defineSource(async () => {
  const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc"
  const res: Res = await myFetch(url)
  return res.data
    .map((k) => {
      return {
        id: k.ClusterIdStr,
        title: k.Title,
        url: `https://www.toutiao.com/trending/${k.ClusterIdStr}/`,
        extra: {
          icon: k.LabelUri?.url,
        },
      }
    })
})
