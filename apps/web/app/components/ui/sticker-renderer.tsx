import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { useEffect, useState } from "react";

const StickerRenderer = ({ src }: { src: string }) => {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const [animationInProgress, setAnimationInProgress] = useState(false);

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

    if (dotLottie) {
      dotLottie.addEventListener("complete", onComplete);
    }

    return () => {
      if (dotLottie) {
        dotLottie.removeEventListener("complete", onComplete);
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
        }
      }}
      style={{
        width: "120px",
      }}
      src={src}
      dotLottieRefCallback={dotLottieRefCallback}
    />
  );
};

export default StickerRenderer;
