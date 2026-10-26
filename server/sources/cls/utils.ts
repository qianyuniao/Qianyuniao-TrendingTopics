/**
 * 信息流源：utils
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
// https://github.com/DIYgod/RSSHub/blob/master/lib/routes/cls/utils.ts
const params = {
  appName: "CailianpressWeb",
  os: "web",
  sv: "7.7.5",
}

export async function getSearchParams(moreParams?: any) {
  const searchParams = new URLSearchParams({ ...params, ...moreParams })
  searchParams.sort()
  searchParams.append("sign", await md5(await myCrypto(searchParams.toString(), "SHA-1")))
  return searchParams
}
