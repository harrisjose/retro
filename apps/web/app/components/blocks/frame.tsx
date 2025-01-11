import { cn } from "@retro/common";
import { useBlock } from "@retro/sdk";
import { useDrag } from "@use-gesture/react";
import { type PropsWithChildren, useRef } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useCamera, useSelection } from "../canvas/store/hooks";

export default function Frame({
  id,
  isAutoHeight = false,
  children,
}: PropsWithChildren<{ id: string; isAutoHeight?: boolean }>) {
  const { block, setPosition } = useBlock(id);
  const { setSelection } = useSelection();
  const {
    camera: { z },
  } = useCamera();

  const ref = useRef<HTMLDivElement>(null);
  const debouncedSetPosition = useDebounceCallback(setPosition, 50);

  useDrag(
    ({ movement: [x, y], memo, event }) => {
      event.preventDefault();
      event.stopPropagation();

      memo = memo ?? { x: block.x, y: block.y };

      setSelection([id]);
      debouncedSetPosition(memo.x + x / z, memo.y + y / z);

      return memo;
    },
    {
      from: () => [block.x, block.y],
      eventOptions: { capture: true, passive: false },
      target: ref,
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
