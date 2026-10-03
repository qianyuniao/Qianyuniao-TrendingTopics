/**
 * PWA 配置（由 vite.config.ts 引入）
 * 生成 manifest 与 Service Worker；文件名固定为 `swx.js`，与 public/sw.js（旧版注销脚本）区分
 * dev 下默认不启用 SW，需要联调时用 `SW_DEV=true` 启动
 */
import process from "node:process"
import type { VitePWAOptions } from "vite-plugin-pwa"
import { VitePWA } from "vite-plugin-pwa"

const pwaOption: Partial<VitePWAOptions> = {
  includeAssets: ["brand/icon.svg", "pwa/apple-touch-icon.png"],
  filename: "swx.js",
  manifest: {
    name: "TrendingTopics",
    short_name: "TrendingTopics",
    description: "Elegant reading of real-time and hottest news",
    theme_color: "#06B6D4",
    icons: [
      {
        src: "pwa/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "pwa/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "pwa/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    navigateFallbackDenylist: [/^\/api/],
  },
  devOptions: {
    enabled: process.env.SW_DEV === "true",
    type: "module",
    navigateFallback: "index.html",
  },
}

export default function pwa() {
  return VitePWA(pwaOption)
}
