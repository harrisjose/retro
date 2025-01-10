import { useBlock } from "@retro/sdk";
import type { PropsWithChildren } from "react";

export default function Frame({
  id,
  isAutoHeight = false,
  children,
}: PropsWithChildren<{ id: string; isAutoHeight?: boolean }>) {
  const block = useBlock(id);
  return (
    <div
      className="absolute"
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
