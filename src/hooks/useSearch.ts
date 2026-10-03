/** 全局搜索栏（Cmd/Ctrl + K）的开关状态，由导航栏与搜索面板共享 */
const searchBarAtom = atom(false)

/** 读取并切换搜索栏：`toggle(true/false)` 显式设置，不传参则取反 */
export function useSearchBar() {
  const [opened, setOpened] = useAtom(searchBarAtom)
  const toggle = useCallback((status?: boolean) => {
    if (status !== undefined) setOpened(status)
    else setOpened(v => !v)
  }, [setOpened])
  return {
    opened,
    toggle,
  }
}
