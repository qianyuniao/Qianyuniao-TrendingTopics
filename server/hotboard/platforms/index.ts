import * as acfun from "./acfun"
import * as baidu from "./baidu"
import * as bilibili from "./bilibili"
import * as channels from "./channels"
import * as csdn from "./csdn"
import * as cto51 from "./cto51"
import * as dgtle from "./dgtle"
import * as douban from "./douban"
import * as douyin from "./douyin"
import * as earthquake from "./earthquake"
import * as gameres from "./gameres"
import * as geekpark from "./geekpark"
import * as github from "./github"
import * as guokr from "./guokr"
import * as hackernews from "./hackernews"
import * as haokan from "./haokan"
import * as hellogithub from "./hellogithub"
import * as hostloc from "./hostloc"
import * as hupu from "./hupu"
import * as huxiu from "./huxiu"
import * as ifanr from "./ifanr"
import * as iqiyi from "./iqiyi"
import * as ithome from "./ithome"
import * as jianshu from "./jianshu"
import * as juejin from "./juejin"
import * as kr36 from "./kr36"
import * as kuaishou from "./kuaishou"
import * as linuxdo from "./linuxdo"
import * as lol from "./lol"
import * as miyoushe from "./miyoushe"
import * as netease from "./netease"
import * as newsmth from "./newsmth"
import * as ngabbs from "./ngabbs"
import * as nodeseek from "./nodeseek"
import * as nytimes from "./nytimes"
import * as pojie52 from "./pojie52"
import * as qqnews from "./qqnews"
import * as sina from "./sina"
import * as sinanews from "./sinanews"
import * as sspai from "./sspai"
import * as thepaper from "./thepaper"
import * as tieba from "./tieba"
import * as todayinhistory from "./todayinhistory"
import * as toutiao from "./toutiao"
import * as v2ex from "./v2ex"
import * as weatheralarm from "./weatheralarm"
import * as weibo from "./weibo"
import * as weread from "./weread"
import * as xiaohongshu from "./xiaohongshu"
import * as yystv from "./yystv"
import * as zhihu from "./zhihu"

/**
 * 平台模块注册表（显式 import，替代 Python 的文件自动发现）
 * 每新增一个平台源，按字母序在此追加一行 import 并在 platforms 对象中加入键值即可。
 */
export const platforms = {
  acfun,
  baidu,
  bilibili,
  channels,
  csdn,
  cto51,
  dgtle,
  douban,
  douyin,
  earthquake,
  gameres,
  geekpark,
  github,
  guokr,
  hackernews,
  haokan,
  hellogithub,
  hostloc,
  hupu,
  huxiu,
  ifanr,
  iqiyi,
  ithome,
  jianshu,
  juejin,
  kr36,
  kuaishou,
  linuxdo,
  lol,
  miyoushe,
  netease,
  newsmth,
  ngabbs,
  nodeseek,
  nytimes,
  pojie52,
  qqnews,
  sina,
  sinanews,
  sspai,
  thepaper,
  tieba,
  todayinhistory,
  toutiao,
  v2ex,
  weatheralarm,
  weibo,
  weread,
  xiaohongshu,
  yystv,
  zhihu,
}
