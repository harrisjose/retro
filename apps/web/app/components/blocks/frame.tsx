import { cn } from "@retro/common";
import { useBlock } from "@retro/sdk";
import { useGesture } from "@use-gesture/react";
import { type PropsWithChildren, useRef } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { BlockEventType, CanvasControllerContext } from "../canvas/machine";
import { useCamera } from "../canvas/store/hooks";

export default function Frame({
  id,
  isAutoHeight = false,
  children,
}: PropsWithChildren<{ id: string; isAutoHeight?: boolean }>) {
  const { block, setPosition } = useBlock(id);
  const debouncedSetPosition = useDebounceCallback(setPosition, 5);

  const {
    camera: { z },
  } = useCamera();

  const controllerRef = CanvasControllerContext.useActorRef();
  const ref = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onDrag: ({ movement: [x, y], memo, event, tap }) => {
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
          });
          return;
        }
        if (
          target.isContentEditable ||
          target.closest("[contenteditable=true]")
        ) {
          return;
        }

        memo = memo ?? { x: block.x, y: block.y };

        controllerRef.send({ type: BlockEventType.BlockDrag, blockId: id });

        debouncedSetPosition(memo.x + x / z, memo.y + y / z);

        return memo;
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
