import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { useEffect, useState } from "react";
import { useInsertion } from "../canvas/store";

const StickerRenderer = ({ src, id }: { src: string; id: string }) => {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const { lastInsertedBlockId } = useInsertion();

  const dotLottieRefCallback = (dotLottie: DotLottie) => {
    setDotLottie(dotLottie);
  };

  useEffect(() => {
    const onComplete = () => {
      if (dotLottie) {
        setAnimationInProgress(false);
        dotLottie.stop();
      }
    };

    const onLoad = () => {
      if (dotLottie && lastInsertedBlockId === id) {
        setAnimationInProgress(true);
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
          dotLottie.play();
          setAnimationInProgress(true);
        }
      }}
      style={{
        width: "64px",
        height: "64px",
      }}
      speed={1.5}
      renderConfig={{
        devicePixelRatio: 2,
        autoResize: true,
      }}
      src={src}
      dotLottieRefCallback={dotLottieRefCallback}
    />
  );
};

export default StickerRenderer;
