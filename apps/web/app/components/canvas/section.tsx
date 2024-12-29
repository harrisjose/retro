import {
  BlockType,
  StickerType,
  useCamera,
  useCreateBlock,
  useSection,
} from "@retro/sdk";
import { useRef } from "react";

const getRandomStickerType = () => {
  return Object.values(StickerType)[
    Math.floor(Math.random() * Object.values(StickerType).length)
  ];
};

export default function SectionRenderer({ id }: { id: string }) {
  const section = useSection(id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { zoom: scale } = useCamera();

  const createBlock = useCreateBlock();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const originalPos = { x: event.clientX, y: event.clientY };
    const parentRect =
      sectionRef.current?.parentElement?.getBoundingClientRect();

    // Calculate click position relative to parent container
    const relativeToParent = {
      x: originalPos.x - (parentRect?.left ?? 0),
      y: originalPos.y - (parentRect?.top ?? 0),
    };

    // Scale back to original coordinate space
    const scaledPos = {
      x: relativeToParent.x / scale,
      y: relativeToParent.y / scale,
    };

    console.log("Original position:", originalPos);
    console.log("Position relative to parent:", relativeToParent);
    console.log("Scaled position:", scaledPos);

    createBlock(
      {
        type: BlockType.Sticker,
        x: scaledPos.x,
        y: scaledPos.y,
        width: 120,
        height: 120,
      },
      {
        stickerType: getRandomStickerType(),
      }
    );
  };

  return (
    <div
      key={id}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-lg"
      style={{
        width: section.width,
        height: section.height,
      }}
      onClick={handleClick}
    ></div>
  );
}
