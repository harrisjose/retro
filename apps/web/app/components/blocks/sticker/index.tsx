import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { type StickerProperties, StickerType } from "@retro/common";
import { StickerJsonMap, useBlockProperties } from "@retro/sdk";
import { shallowEqual } from "@xstate/react";
import { useEffect, useState } from "react";
import {
  CanvasControllerContext,
  CanvasMode,
  SelectionMode,
} from "../../canvas/machine";

const ANIMATION_PLAY_COUNT = 3;
const StickerRenderer = ({
  src,
  id,
  isActive,
  isDragging,
}: { src: string; id: string; isActive: boolean; isDragging: boolean }) => {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [lastInsertedBlockId] = CanvasControllerContext.useSelector(
    (snapshot) => {
      return [snapshot?.context.insertion.lastInsertedId];
    },
    shallowEqual,
  );

  const dotLottieRefCallback = (dotLottie: DotLottie | null) => {
    setDotLottie(dotLottie);
  };

  useEffect(() => {
    const onComplete = () => {
      if (dotLottie) {
        setPlayCount((count) => {
          const newCount = count + 1;
          if (newCount >= ANIMATION_PLAY_COUNT) {
            setAnimationInProgress(false);
            dotLottie.stop();
            return 0;
          }
          dotLottie.play();
          return newCount;
        });
      }
    };

    const onLoad = () => {
      if (dotLottie && lastInsertedBlockId === id) {
        setAnimationInProgress(true);
        setPlayCount(0);
        dotLottie.play();
      }
    };

    if (dotLottie) {
      dotLottie.addEventListener("complete", onComplete);
      dotLottie.addEventListener("load", onLoad);
    }

    return () => {
      if (dotLottie) {
        dotLottie.removeEventListener("complete", onComplete);
        dotLottie.removeEventListener("load", onLoad);
      }
    };
  }, [dotLottie]);

  useEffect(() => {
    if (isDragging) {
      dotLottie?.pause();
    } else if (animationInProgress) {
      dotLottie?.play();
    }
  }, [isDragging, animationInProgress]);

  return (
    <DotLottieReact
      layout={{
        align: [0.5, 0.5],
        fit: "fit-width",
      }}
      onMouseEnter={() => {
        if (dotLottie && !animationInProgress) {
          setPlayCount(0);
          dotLottie.play();
          setAnimationInProgress(true);
        }
      }}
      style={{
        width: "64px",
        height: "64px",
        border: isActive
          ? "2px solid hsl(var(--selection))"
          : "2px solid transparent",
        borderRadius: "12px",
      }}
      speed={1.5}
      renderConfig={{
        devicePixelRatio: 20,
        autoResize: true,
      }}
      src={src}
      dotLottieRefCallback={dotLottieRefCallback}
    />
  );
};

export default function StickerBlock({ id }: { id: string }) {
  const properties = useBlockProperties<StickerProperties>(id).properties;
  const stickerType = (properties as { stickerType: StickerType }).stickerType;

  const [isSelected, isDragging] = CanvasControllerContext.useSelector((s) => {
    return [
      s?.context.selection.includes(id),
      s?.matches({ [CanvasMode.Selected]: SelectionMode.Dragging }),
    ];
  });

  return (
    <div className="relative z-[100] select-none">
      <StickerRenderer
        src={StickerJsonMap[stickerType].json}
        id={id}
        isActive={isSelected}
        isDragging={isDragging}
      />
    </div>
  );
}
