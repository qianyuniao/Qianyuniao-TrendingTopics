export {}
declare global {
  const $: typeof import('clsx').clsx
  const Author: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/consts').Author
  const BOARD_CARD_BASE: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index').BOARD_CARD_BASE
  const Color: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').Color
  const HOTBOARD_REFRESH_SECONDS: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useHotboard').HOTBOARD_REFRESH_SECONDS
  const Homepage: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/consts').Homepage
  const Interval: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/consts').Interval
  const Repo: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/consts').Repo
  const Source: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/sources').Source
  const SourceResponse: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/data').SourceResponse
  const TTL: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/consts').TTL
  const Timer: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index').Timer
  const Version: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/consts').Version
  const atom: typeof import('jotai').atom
  const atomWithStorage: typeof import('jotai/utils').atomWithStorage
  const cacheSources: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/data').cacheSources
  const colorOfSource: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').colorOfSource
  const columnColors: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').columnColors
  const columns: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').columns
  const currentColumnIDAtom: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/index').currentColumnIDAtom
  const currentSourcesAtom: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/index').currentSourcesAtom
  const delay: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/utils').delay
  const fixedColumnIds: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').fixedColumnIds
  const focusSourcesAtom: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/index').focusSourcesAtom
  const formatCountdown: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useCountdown').formatCountdown
  const goToTopAtom: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/index').goToTopAtom
  const isPageReload: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useOnReload').isPageReload
  const isiOS: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index').isiOS
  const journalColumnIds: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').journalColumnIds
  const journalSet: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').journalSet
  const metadata: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').metadata
  const myFetch: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index').myFetch
  const policyColumnIds: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').policyColumnIds
  const policySet: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').policySet
  const preprocessMetadata: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/primitiveMetadataAtom').preprocessMetadata
  const primitiveMetadataAtom: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/primitiveMetadataAtom').primitiveMetadataAtom
  const randomUUID: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/utils').randomUUID
  const refetchSources: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/data').refetchSources
  const relativeTime: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/utils').relativeTime
  const safeParseString: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index').safeParseString
  const sources: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/sources').default
  const statsColumnIds: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').statsColumnIds
  const statsSet: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/metadata').statsSet
  const toastAtom: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useToast').toastAtom
  const typeSafeObjectEntries: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/type.util').typeSafeObjectEntries
  const typeSafeObjectFromEntries: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/type.util').typeSafeObjectFromEntries
  const useAtom: typeof import('jotai').useAtom
  const useAtomValue: typeof import('jotai').useAtomValue
  const useBoardOrder: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useBoardOrder').useBoardOrder
  const useCallback: typeof import('react').useCallback
  const useContext: typeof import('react').useContext
  const useCountdown: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useCountdown').useCountdown
  const useEffect: typeof import('react').useEffect
  const useEntireQuery: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/query').useEntireQuery
  const useFocus: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useFocus').useFocus
  const useFocusWith: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useFocus').useFocusWith
  const useHotboardData: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useHotboard').useHotboardData
  const useHotboardPlatforms: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useHotboard').useHotboardPlatforms
  const useLogin: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useLogin').useLogin
  const useMemo: typeof import('react').useMemo
  const useOnReload: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useOnReload').useOnReload
  const usePWA: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/usePWA').usePWA
  const useReducer: typeof import('react').useReducer
  const useRef: typeof import('react').useRef
  const useRefetch: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useRefetch').useRefetch
  const useRelativeTime: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useRelativeTime').useRelativeTime
  const useSearchBar: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useSearch').useSearchBar
  const useSetAtom: typeof import('jotai').useSetAtom
  const useState: typeof import('react').useState
  const useSync: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useSync').useSync
  const useToast: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/useToast').useToast
  const useUpdateQuery: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/hooks/query').useUpdateQuery
  const verifyPrimitiveMetadata: typeof import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/verify').verifyPrimitiveMetadata
}
// for type re-export
declare global {
  // @ts-ignore
  export type { Timer } from 'D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index'
  import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/utils/index')
  // @ts-ignore
  export type { Update, ToastItem } from 'D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/types'
  import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/src/atoms/types')
  // @ts-ignore
  export type { MaybePromise } from 'D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/type.util'
  import('D:/03_OpenSourceProject/01media/热榜/Qianyuniao-TrendingTopics/shared/type.util')
}