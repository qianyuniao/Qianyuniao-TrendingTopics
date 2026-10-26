export function Footer() {
  /** 作者的个人媒体主页，图标直接复用各平台 favicon（public/icons/<平台>.png） */
  const socialLinks = [
    { name: "简书", icon: "jianshu", href: "https://www.jianshu.com/u/712e305ae5b2" },
    { name: "知乎", icon: "zhihu", href: "https://www.zhihu.com/people/Sky_wang7" },
    { name: "CSDN博客", icon: "csdn", href: "https://blog.csdn.net/qq_42673430?spm=1010.2135.3001.5421" },
    { name: "快手", icon: "kuaishou", href: "https://www.kuaishou.com/profile/3x95u5rkkdv5t39" },
    { name: "B站", icon: "bilibili", href: "https://space.bilibili.com/271441755?spm_id_from=333.999.0.0" },
    { name: "抖音", icon: "douyin", href: "https://www.ixigua.com/home/1170308628488359?list_entrance=homepage" },
    {
      name: "小红书",
      icon: "xiaohongshu",
      href: "https://www.xiaohongshu.com/user/profile/651fe366000000002402efe8?xsec_token=ABBvdiJvg1zhI437aKMRoK_8kz95Xo0aLgr6sRSFa5nX8%3D&xsec_source=pc_search",
    },
  ]

  return (
    <>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mb-3">
        {socialLinks.map(item => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`千语鸟 · ${item.name}`}
            className="flex items-center gap-1.5 op-70 hover:(op-100 color-primary) transition-all"
          >
            <img
              src={`/icons/${item.icon}.png`}
              alt=""
              loading="lazy"
              className="h-4 w-4 rounded-sm object-contain"
            />
            {item.name}
          </a>
        ))}
      </nav>
      <a href={`${Homepage}/blob/main/LICENSE`} target="_blank">MIT LICENSE</a>
      <span>
        <span>TrendingTopics © 2024 By </span>
        <a href={Author.url} target="_blank">
          {Author.name}
        </a>
      </span>
    </>
  )
}
