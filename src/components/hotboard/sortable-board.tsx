import type { ReactNode } from "react"
import type { BaseEventPayload, ElementDragType } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useThrottleFn } from "ahooks"
import { DndContext } from "~/components/common/dnd"
import { useSortable } from "~/components/common/dnd/useSortable"
import { useBoardOrder } from "~/hooks/useBoardOrder"

/** 传给看板卡片的拖拽连接点 */
export interface SortableCardProps {
  setNodeRef: (el: HTMLElement | null) => void
  setHandleRef: (el: HTMLElement | null) => void
  isDragging: boolean
}

/**
 * 可拖拽排序的看板网格
 * 拖拽体验与「最热」专栏一致：按住卡片右上角手柄拖动，顺序持久化到 localStorage
 */
export function SortableBoard({
  storageKey,
  ids,
  className,
  renderCard,
}: {
  storageKey: string
  ids: readonly string[]
  className?: string
  renderCard: (id: string, sortable: SortableCardProps) => ReactNode
}) {
  const [order, setOrder] = useBoardOrder(storageKey, ids)
  const [parent] = useAutoAnimate({ duration: 200 })

  const onDropTargetChange = useCallback(({ location, source }: BaseEventPayload<ElementDragType>) => {
    const target = location.current.dropTargets[0]
    if (!target?.data || !source?.data) return
    const fromIndex = order.indexOf(source.data.id as string)
    const toIndex = order.indexOf(target.data.id as string)
    if (fromIndex === toIndex || fromIndex === -1 || toIndex === -1) return
    setOrder(reorderWithEdge({
      list: order,
      startIndex: fromIndex,
      indexOfTarget: toIndex,
      closestEdgeOfTarget: extractClosestEdge(target.data),
      axis: "vertical",
    }))
  }, [order, setOrder])

  // 与专栏拖拽一致：节流，避免频繁重排
  const { run } = useThrottleFn(onDropTargetChange, {
    leading: true,
    trailing: true,
    wait: 200,
  })

  return (
    <DndContext onDropTargetChange={run}>
      <div ref={parent} className={className}>
        {order.map(id => (
          <SortableItem key={id} id={id}>
            {sortable => renderCard(id, sortable)}
          </SortableItem>
        ))}
      </div>
    </DndContext>
  )
}

function SortableItem({ id, children }: { id: string, children: (sortable: SortableCardProps) => ReactNode }) {
  const { setNodeRef, setHandleRef, isDragging } = useSortable({ id })
  return <>{children({ setNodeRef, setHandleRef, isDragging })}</>
}
