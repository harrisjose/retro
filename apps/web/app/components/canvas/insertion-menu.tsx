import CardSvg from "@/components/svg/card.svg?react";
import StickerSvg from "@/components/svg/sticker.svg?react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { raw } from "@retro/common";
import { BlockType, CardColor, StickerJsonMap, StickerType } from "@retro/sdk";
import { useState } from "react";
import * as Y from "yjs";
import { CanvasControllerContext, CanvasEventType } from "./machine";

const getRandomCardColor = () => {
  return Object.values(CardColor)[
    Math.floor(Math.random() * Object.values(CardColor).length)
  ];
};

const StickerMenu = () => {
  const [open, setOpen] = useState(false);

  const controllerRef = CanvasControllerContext.useActorRef();

  const handleClick = (stickType: StickerType) => {
    controllerRef.send({
      type: CanvasEventType.InsertStart,
      blockToInsert: {
        type: BlockType.Sticker,
        properties: {
          stickerType: stickType,
        },
      },
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`cursor-pointer hover:fill-black/[0.04] fill-white outline-none ${
          open && "fill-black/[0.04]"
        }`}
      >
        <StickerSvg />
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        side="top"
        className="shadow-[0px_0px_30px_3px_rgba(0,0,0,0.1)] border border-black/10 bg-[#fefefe] p-[6px] rounded-[9px] flex flex-wrap w-[380px]"
      >
        {Object.entries(StickerJsonMap).map(([key, value]) => (
          <div
            key={key}
            className="hover:scale-[1.2] transition-all hover:rotate-[4deg] p-[12px] cursor-pointer"
            onClick={() => handleClick(key as StickerType)}
          >
            <DotLottieReact
              layout={{
                align: [0.5, 0.5],
                fit: "fit-width",
              }}
              style={{
                width: "28px",
                height: "28px",
              }}
              renderConfig={{
                devicePixelRatio: 4,
              }}
              src={value.json}
            />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export const InsertionMenu = () => {
  const controllerRef = CanvasControllerContext.useActorRef();

  const insertCard = () => {
    controllerRef.send({
      type: CanvasEventType.InsertStart,
      blockToInsert: {
        type: BlockType.Card,
        properties: {
          color: getRandomCardColor(),
          content: raw(new Y.XmlFragment()),
        },
      },
    });
  };

  return (
    <div className="absolute bottom-[16px] left-[50%] translate-x-[-50%] bg-white rounded-[8px] p-[6px] flex gap-[2px] shadow-[0px_8px_20px_0px_#0000001A]">
      <StickerMenu />
      <div
        className="cursor-pointer hover:fill-black/[0.04] fill-white"
        onClick={insertCard}
      >
        <CardSvg />
      </div>
    </div>
  );
};
