import { useRegisterSW } from "virtual:pwa-register/react"
import { useMount } from "react-use"
import { useToast } from "./useToast"

/**
 * PWA 更新流程：启动后检测新版本
 * - 有更新：提示用户，5 秒后自动更新（点「立刻更新」立即执行）
 * - 更新完成：弹一次「更新成功」并提供跳转 release 的入口
 */
export function usePWA() {
  const toaster = useToast()
  const { updateServiceWorker, needRefresh: [needRefresh] } = useRegisterSW()

  useMount(async () => {
    const update = () => {
      updateServiceWorker().then(() => localStorage.setItem("updated", "1"))
    }
    await delay(1000)
    if (localStorage.getItem("updated")) {
      localStorage.removeItem("updated")
      toaster("更新成功，赶快体验吧", {
        action: {
          label: "查看更新",
          onClick: () => {
            window.open(`${Homepage}/releases/tag/v${Version}`)
          },
        },
      })
    } else if (needRefresh) {
      if (!navigator) return

      if ("connection" in navigator && !navigator.onLine) return

      const resp = await myFetch("/latest")

      if (resp.v && resp.v !== Version) {
        toaster("有更新，5 秒后自动更新", {
          action: {
            label: "立刻更新",
            onClick: update,
          },
          onDismiss: update,
        })
      }
    }
  })
}
