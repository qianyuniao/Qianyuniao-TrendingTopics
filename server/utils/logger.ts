/**
 * 服务端日志实例（consola）
 * level 4 = 输出 info 及以上，抓取成功 / 失败都走这里
 */
import { createConsola } from "consola"

export const logger = createConsola({
  level: 4,
  formatOptions: {
    columns: 80,
    colors: true,
    compact: false,
    date: true,
  },
})
