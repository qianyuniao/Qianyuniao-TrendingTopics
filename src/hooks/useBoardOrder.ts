/**
 * 看板卡片拖拽排序
 * 顺序按 `storageKey` 持久化到 localStorage，规则：
 * - 只有当前看板中存在的 id 参与排序
 * - 新出现的卡片自动追加到末尾
 * - 已保存但当前不可见的 id 保留在存储里（例如热榜广场切换分类后切回）
 */
export function useBoardOrder(storageKey: string, ids: readonly string[]) {
  const key = `board-order:${storageKey}`

  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof localStorage === "undefined") return []
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? "null")
      return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : []
    } catch {
      return []
    }
  })

  /** 当前可见卡片的最终顺序 */
  const order = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const id of saved) {
      if (ids.includes(id) && !seen.has(id)) {
        seen.add(id)
        result.push(id)
      }
    }
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id)
        result.push(id)
      }
    }
    return result
  }, [saved, ids])

  // 用字符串做依赖，避免 order 每次渲染都是新数组导致死循环
  const serialized = order.join("|")
  useEffect(() => {
    if (typeof localStorage === "undefined") return
    try {
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]")
      const keep = Array.isArray(prev)
        ? prev.filter((id): id is string => typeof id === "string" && !order.includes(id))
        : []
      localStorage.setItem(key, JSON.stringify([...order, ...keep]))
    } catch {
      // 隐私模式等写入失败可忽略
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, serialized])

  const setOrder = useCallback((next: string[]) => {
    // 保留本次不可见的 id，避免切换分类时丢失其它卡片的排序
    setSaved(prev => [...next, ...prev.filter(id => !next.includes(id))])
  }, [])

  return [order, setOrder] as const
}
