import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BlockType, CardColor, StickerType, cn, raw } from "@retro/common";
import { StickerJsonMap, useDocument, useProfile } from "@retro/sdk";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Y from "yjs";
import Back from "../svg/back";
import Card from "../svg/card";
import Sticker from "../svg/sticker";
import { Separator } from "../ui/separator";
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
        className={`cursor-pointer hover:bg-black/[0.04] outline-none p-1 rounded-sm ${
          open && "bg-black/[0.04]"
        }`}
      >
        <Sticker className="w-4 h-4" />
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
            onClick={() => handleClick(key as StickerType)}
          >
            <img src={`/stickers/${key}.png`} className="w-10 h-10" />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

const CardMenu = () => {
  const controllerRef = CanvasControllerContext.useActorRef();
  const { profile } = useProfile();

  console.log("card menu", profile);
  const insertCard = () => {
    controllerRef.send({
      type: CanvasEventType.InsertStart,
      blockToInsert: {
        type: BlockType.Card,
        properties: {
          color: getRandomCardColor(),
          content: raw(new Y.XmlFragment()),
          createdBy: {
            id: profile.id,
            name: profile.name,
          },
        },
      },
    });
  };

  return (
    <button
      className="hover:bg-black/[0.04] rounded-sm p-1"
      onClick={insertCard}
    >
      <Card className="w-4 h-4" />
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
        "flex gap-1 p-[6px] items-center justify-center grow h-[36px]",
      )}
    >
      <button onClick={onBack} className="hover:bg-black/[0.04] p-1 rounded-sm">
        <Back className="w-4 h-4" />
      </button>
      <Separator
        orientation="vertical"
        className="bg-black opacity-5 rounded-sm"
      />
      <div className="text-sm">{document.name}</div>
      <Separator
        orientation="vertical"
        className="bg-black opacity-5 rounded-sm"
      />
      <StickerMenu />
      <CardMenu />
    </div>
  );
};
