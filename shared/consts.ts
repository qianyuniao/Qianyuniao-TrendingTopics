/**
 * 缓存过期时间
 */
import packageJSON from "../package.json"

export const TTL = 30 * 60 * 1000
/**
 * 默认刷新间隔, 10 min
 */
export const Interval = 10 * 60 * 1000

export const Homepage = packageJSON.homepage

/** GitHub 仓库的 `owner/repo` 形式，用于拼接 stars / forks 徽章等地址 */
export const Repo = packageJSON.homepage.replace("https://github.com/", "")

export const Version = packageJSON.version
export const Author = packageJSON.author
