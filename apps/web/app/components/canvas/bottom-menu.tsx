import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BlockType, CardColor, StickerType, cn, raw } from "@retro/common";
import {
  StickerJsonMap,
  TimerProvider,
  useDocument,
  useProfile,
} from "@retro/sdk";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Y from "yjs";
import { DocumentMusic } from "../music";

import ArrowDown from "../svg/arrow-down";
import CardCreatePlus from "../svg/card-create-plus";
import { DocumentTimerWrapper } from "../timer";
import { Separator } from "../ui/separator";
import { useInsertDrag } from "./hooks/use-insert-drag";
import { CanvasControllerContext } from "./machine";

const getRandomCardColor = () => {
  return Object.values(CardColor)[
    Math.floor(Math.random() * Object.values(CardColor).length)
  ];
};

const StickerMenu = () => {
  const [open, setOpen] = useState(false);

  const controllerRef = CanvasControllerContext.useActorRef();
  const { handleInsertInteraction } = useInsertDrag();

  const createStickerBlockToInsert = (stickerType: StickerType) => ({
    type: BlockType.Sticker,
    properties: {
      stickerType,
    },
  });

  const handleInteraction = (e: React.MouseEvent, stickerType: StickerType) => {
    handleInsertInteraction(e, createStickerBlockToInsert(stickerType));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`cursor-pointer relative  w-[105px] h-full hover:bg-insertionHover px-[12px]`}
      >
        <div className="flex items-center justify-center gap-1 cursor-pointer relative w-full h-full">
          <div className="flex-1">
            <img
              src="/insertion-menu/thinking-face.png"
              alt="emoji-picker-1"
              className="absolute top-[7px] left-0 w-4 h-4 object-cover hover:scale-150 transition-transform duration-200"
            />
            <img
              src="/insertion-menu/fire.png"
              alt="emoji-picker-2"
              className="absolute top-[7px] left-[23px] w-4 h-4 object-cover hover:scale-150 transition-transform duration-200"
            />
            <img
              src="/insertion-menu/joy.png"
              alt="emoji-picker-3"
              className="absolute top-[7px] left-[45px] w-4 h-4 object-cover hover:scale-150 transition-transform duration-200"
            />
            <img
              src="/insertion-menu/red-heart.png"
              alt="emoji-picker-1"
              className="absolute top-[27px] left-0 w-4 h-4 object-cover hover:scale-150 transition-transform duration-200"
            />
            <img
              src="/insertion-menu/osm.png"
              alt="emoji-picker-1"
              className="absolute top-[25px] left-[23px] w-[34px] h-4 object-cover hover:scale-150 transition-transform duration-200"
            />
          </div>
          <ArrowDown />
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        side="top"
        className="shadow-[0px_0px_30px_3px_rgba(0,0,0,0.1)] border border-black/10 bg-[#fefefe] p-[6px] rounded-[9px] flex flex-wrap w-[380px]"
      >
        {Object.entries(StickerJsonMap).map(([key, value]) => (
          <div
            key={key}
            className="hover:scale-[1.2] transition-all hover:rotate-[4deg] cursor-pointer"
            onMouseDown={(e) => handleInteraction(e, key as StickerType)}
          >
            <img src={`/stickers/${key}.png`} className="w-10 h-10" />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

const CardMenu = () => {
  const { profile } = useProfile();
  const { handleInsertInteraction } = useInsertDrag();

  const createCardBlockToInsert = () => ({
    type: BlockType.Card,
    properties: {
      color: getRandomCardColor(),
      content: raw(new Y.XmlFragment()),
      createdBy: {
        id: profile.id,
        name: profile.name,
      },
    },
  });

  const handleInteraction = (e: React.MouseEvent) => {
    handleInsertInteraction(e, createCardBlockToInsert());
  };

  return (
    <button
      onMouseDown={handleInteraction}
      className="overflow-hidden px-[20px] relative w-[90px] h-full hover:bg-insertionHover group"
    >
      <div
        className="w-[50px] h-[50px] rounded-sm -rotate-[21deg] top-[14px] absolute group-hover:scale-[120%] transition-transform duration-200"
        style={{
          background: "rgba(203, 191, 255, 1)",
          boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.5)",
        }}
      ></div>
      <div
        className="w-[50px] h-[50px] rounded-sm top-[14px] absolute group-hover:scale-[120%] transition-transform duration-200"
        style={{
          background: "rgba(255, 232, 147, 1)",
          boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.5)",
        }}
      ></div>
      <CardCreatePlus className="absolute left-[44%] top-[50%] w-[9px] h-[16px]" />
    </button>
  );
};

export const InsertionMenu = () => {
  const navigate = useNavigate();
  const document = useDocument();
  const onBack = () => {
    navigate("/");
  };

  return (
    <div
      className={cn(
        "absolute bottom-[16px] left-[50%] translate-x-[-50%]",
        "bg-white rounded-[8px] shadow-[0px_8px_20px_0px_#0000001A]",
        "flex items-center justify-center grow h-[50px]",
      )}
    >
      <TimerProvider documentId={document.id}>
        <DocumentTimerWrapper />
        <Separator orientation="vertical" className="bg-black opacity-5" />
        <CardMenu />
        <Separator orientation="vertical" className="bg-black opacity-5" />
        <StickerMenu />
        <Separator orientation="vertical" className="bg-black opacity-5" />
        <DocumentMusic />
      </TimerProvider>
    </div>
  );
};
