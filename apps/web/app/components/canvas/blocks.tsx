import { BlockType } from "@retro/common";
import { useBlockMap } from "@retro/sdk";
import { match } from "ts-pattern";
import CardBlock from "../blocks/card";
import Frame from "../blocks/frame";
import StickerBlock from "../blocks/sticker";
import Copy from "../svg/copy";
import Trash from "../svg/trash";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "../ui/context-menu";

const BlockRenderer = ({
  id,
  blockType,
  isAutoHeight = false,
  onDuplicate,
  onDelete,
}: {
  id: string;
  blockType: BlockType;
  isAutoHeight?: boolean;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Frame key={id} id={id} isAutoHeight={isAutoHeight}>
          {match(blockType)
            .with(BlockType.Card, () => <CardBlock key={id} id={id} />)
            .with(BlockType.Sticker, () => <StickerBlock key={id} id={id} />)
            .exhaustive()}
        </Frame>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[190px]">
        <ContextMenuItem
          className="flex items-center"
          onClick={() => onDuplicate(id)}
        >
          <Copy className="w-4 h-4 mr-[2px]" />
          Duplicate
          <ContextMenuShortcut className="ml-auto">Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          className="flex items-center"
          onClick={() => onDelete(id)}
        >
          <Trash className="w-4 h-4 mr-[2px]" />
          Delete
          <ContextMenuShortcut className="ml-auto">DEL</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default function BlocksRenderer({
  onDuplicate,
  onDelete,
}: {
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}) {
  const blocks = useBlockMap();
  return (
    <>
      {Object.entries(blocks).map(([id, block]) => {
        return match(block.type)
          .with(BlockType.Card, () => (
            <BlockRenderer
              key={id}
              id={id}
              blockType={block.type}
              isAutoHeight={true}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))
          .with(BlockType.Sticker, () => (
            <BlockRenderer
              key={id}
              id={id}
              blockType={block.type}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))
          .exhaustive();
      })}
    </>
  );
}
