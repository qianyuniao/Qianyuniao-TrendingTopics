/**
 * 「关注」数据源的切换与判断
 * - `useFocus()`：适用于列表 / 批量场景，返回 `toggleFocus(id)` 与 `isFocused(id)`
 * - `useFocusWith(id)`：单个数据源的便捷版本
 */
import type { SourceID } from "@shared/types"
import { focusSourcesAtom } from "~/atoms"

export function useFocus() {
  const [focusSources, setFocusSources] = useAtom(focusSourcesAtom)
  const toggleFocus = useCallback((id: SourceID) => {
    setFocusSources(focusSources.includes(id) ? focusSources.filter(i => i !== id) : [...focusSources, id])
  }, [setFocusSources, focusSources])
  const isFocused = useCallback((id: SourceID) => focusSources.includes(id), [focusSources])

  return {
    toggleFocus,
    isFocused,
  }
}

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
