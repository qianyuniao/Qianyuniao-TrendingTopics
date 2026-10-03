import type { ToastItem } from "~/atoms/types"

/** 全局提示队列，由 src/components/common/toast.tsx 消费渲染 */
export const toastAtom = atom<ToastItem[]>([])

/** 弹出一条提示，返回可直接调用的函数：`toaster("消息", { action, onDismiss })` */
export function useToast() {
  const setToastItems = useSetAtom(toastAtom)
  return useCallback((msg: string, props?: Omit<ToastItem, "id" | "msg">) => {
    setToastItems(prev => [
      {
        msg,
        id: Date.now(),
        ...props,
      },
      ...prev,
    ])
  }, [setToastItems])
}
