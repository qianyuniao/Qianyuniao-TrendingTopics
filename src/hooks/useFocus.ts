/**
 * 「关注」数据源的切换与判断
 * 关注列表保存在 focusSourcesAtom（本地持久化），
 * useFocusWith(id) 是单个数据源的便捷版本：返回该源的 toggle 与是否已被关注
 */
import type { SourceID } from "@shared/types"
import { focusSourcesAtom } from "~/atoms"

export function useFocusWith(id: SourceID) {
  const [focusSources, setFocusSources] = useAtom(focusSourcesAtom)
  const toggleFocus = useCallback(() => {
    setFocusSources(focusSources.includes(id) ? focusSources.filter(i => i !== id) : [...focusSources, id])
  }, [setFocusSources, focusSources, id])
  const isFocused = useMemo(() => focusSources.includes(id), [id, focusSources])

  return {
    toggleFocus,
    isFocused,
  }
}
