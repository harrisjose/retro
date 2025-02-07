import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { type StickerProperties, StickerType } from "@retro/common";
import { StickerJsonMap, useBlockProperties } from "@retro/sdk";
import { shallowEqual } from "@xstate/react";
import { useEffect, useState } from "react";
import { CanvasControllerContext } from "../../canvas/machine";

const ANIMATION_PLAY_COUNT = 3;
const StickerRenderer = ({
  src,
  id,
  isActive,
}: { src: string; id: string; isActive: boolean }) => {
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
          ? "2px solid rgba(0, 0, 0, 0.2)"
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

  const isSelected = CanvasControllerContext.useSelector((snapshot) => {
    return snapshot?.context.selection.includes(id);
  });

  return (
    <StickerRenderer
      src={StickerJsonMap[stickerType].json}
      id={id}
      isActive={isSelected}
    />
  );
}
