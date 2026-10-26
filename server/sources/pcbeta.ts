/**
 * 信息流源：pcbeta
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
export default defineSource({
  "pcbeta-windows11": defineRSSSource("https://bbs.pcbeta.com/forum.php?mod=rss&fid=563&auth=0"),
  "pcbeta-windows": defineRSSSource("https://bbs.pcbeta.com/forum.php?mod=rss&fid=521&auth=0"),
})
