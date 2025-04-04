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

import ArrowDown from "../svg/arrow-down";
import CardCreatePlus from "../svg/card-create-plus";
import { Separator } from "../ui/separator";
import { useInsertDrag } from "./hooks/use-insert-drag";

const getRandomCardColor = () => {
  return Object.values(CardColor)[
    Math.floor(Math.random() * Object.values(CardColor).length)
  ];
};

const StickerMenu = () => {
  const [open, setOpen] = useState(false);

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
        className={`cursor-pointer relative  w-[128px] h-full group hover:bg-insertionHover px-[12px]`}
      >
        <div className="flex items-center justify-center gap-1 cursor-pointer relative w-full h-full">
          <div className="flex-1 group-hover:scale-[1.1] group-hover:rotate-[-4deg] transition-all duration-200">
            <img
              src="/insertion-menu/emoji.png"
              alt="emoji-picker-1"
              className="left-[23px] w-[76px] h-[46px] object-cover"
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
            className="hover:scale-[1.2] transition-all duration-20 hover:rotate-[4deg] cursor-pointer"
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
  const { document } = useDocument();

  const createCardBlockToInsert = () => ({
    type: BlockType.Card,
    properties: {
      color: getRandomCardColor(),
      content: raw(new Y.XmlFragment()),
      // Do not store user info for anonymous retros
      createdBy: document.isAnonymous
        ? null
        : {
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
      className="flex overflow-hidden scroll-pb-3 relative w-[128px] h-full hover:bg-insertionHover group justify-around"
    >
      <div
        className="w-[50px] h-[70px] rounded-sm -rotate-[21deg] top-[20px] absolute group-hover:scale-[120%] group-hover:-rotate-6 transition-all duration-200"
        style={{
          background: "rgba(203, 191, 255, 1)",
          boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.5)",
        }}
      ></div>
      <div
        className="w-[50px] h-[70px] rounded-sm top-[20px] absolute group-hover:scale-[120%] group-hover:rotate-2 transition-all duration-200"
        style={{
          background: "rgba(255, 232, 147, 1)",
          boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.5)",
        }}
      ></div>
      <CardCreatePlus className="absolute left-[46%] top-[50%] w-[9px] h-[16px]" />
    </button>
  );
};

export const InsertionMenu = () => {
  const navigate = useNavigate();
  const { document } = useDocument();
  const onBack = () => {
    navigate("/");
  };

  return (
    <div
      className={cn(
        "absolute bottom-[16px] left-[50%] translate-x-[-50%]",
        "bg-white rounded-[8px] shadow-[0px_8px_20px_0px_#0000001A]",
        "flex items-center justify-center grow h-[68px] overflow-hidden",
      )}
    >
      <TimerProvider documentId={document.id}>
        {/* <DocumentTimerWrapper />
        <Separator orientation="vertical" className="bg-black opacity-5" /> */}
        <CardMenu />
        <Separator orientation="vertical" className="bg-black opacity-5" />
        <StickerMenu />
        {/* <Separator orientation="vertical" className="bg-black opacity-5" /> */}
        {/* <DocumentMusic /> */}
      </TimerProvider>
    </div>
  );
};
