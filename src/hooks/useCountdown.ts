import { useCallback, useEffect, useState } from "react"

/**
 * 倒计时（秒）：每秒递减，归零后回到初始值循环。
 * 返回当前剩余秒数 `left` 与手动重置 `reset`。
 */
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    setLeft(seconds)
    const timer = setInterval(() => {
      setLeft(v => (v <= 1 ? seconds : v - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [seconds])
  const reset = useCallback(() => setLeft(seconds), [seconds])
  return { left, reset }
}

/** 把秒数格式化为 MM:SS */
export function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}
