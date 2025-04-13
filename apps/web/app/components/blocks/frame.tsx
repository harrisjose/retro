import { cn } from "@retro/common";
import { useBlock } from "@retro/sdk";
import { useGesture } from "@use-gesture/react";
import { type PropsWithChildren, useRef } from "react";
import { BlockEventType, CanvasControllerContext } from "../canvas/machine";
import { useCamera } from "../canvas/store/hooks";

export default function Frame({
  id,
  isAutoHeight = false,
  children,
}: PropsWithChildren<{ id: string; isAutoHeight?: boolean }>) {
  const { block } = useBlock(id);

  const {
    camera: { z },
  } = useCamera();

  const controllerRef = CanvasControllerContext.useActorRef();
  const ref = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onDrag: ({ movement: [x, y], event, tap }) => {
        const target = event.target as HTMLElement;
        if (tap) {
          if (target.closest("[data-block-toolbar]")) {
            // If its a toolbar element we should not trigger a click event
            // since that might focus the block
            controllerRef.send({
              type: BlockEventType.BlockExitEditing,
              blockId: id,
            });
            return;
          }

          controllerRef.send({
            type: BlockEventType.BlockClick,
            blockId: id,
            blockType: block.type,
          });
          return;
        }

        // If the target is in an editor, we should not trigger a drag event
        // TODO @harris: How can we make editable areas also draggable?
        if (
          target.isContentEditable ||
          target.closest("[contenteditable=true]")
        ) {
          return;
        }

        controllerRef.send({
          type: BlockEventType.BlockDrag,
          blockId: id,
          payload: { dx: x / z, dy: y / z },
        });
      },
      onDragEnd: () => {
        controllerRef.send({ type: BlockEventType.BlockDragEnd, blockId: id });
      },
    },
    {
      target: ref,
      drag: {
        from: () => [block.x, block.y],
        filterTaps: true,
      },
    },
  );

  return (
    <div
      ref={ref}
      className={cn(`absolute touch-none `)}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: isAutoHeight ? "auto" : block.height,
        ...(isAutoHeight ? { minHeight: block.height } : {}),
      }}
    >
      {children}
    </div>
  );
}
