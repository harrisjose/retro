import type { StickerType } from "@retro/common";
import { Cursor } from "../../ui/cursor";

export default function StickerCursor({
  width,
  height,
  stickerType,
  cameraZ,
}: {
  width: number;
  height: number;
  stickerType: StickerType;
  cameraZ: number;
}) {
  return (
    <Cursor attachToParent>
      <div
        className="relative"
        style={{
          transform: `scale(${cameraZ})`,
        }}
      >
        <img
          src={`/stickers/${stickerType}.png`}
          className="object-fit"
          // TODO - Need to see why this offset is needed for the cursor
          style={{
            width: width + 34,
            height: height + 34,
            opacity: 0.5,
          }}
        />
      </div>
    </Cursor>
  );
}
