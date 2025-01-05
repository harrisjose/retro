import { DEFAULT_MUSIC_ID, MusicStatus, useDocumentMusic } from "@retro/sdk";
import MusicSvg from "../svg/music.svg?react";
import PauseSvg from "../svg/pause.svg?react";
import PlaySvg from "../svg/play.svg?react";

import { useEffect, useState } from "react";
import acousticGuitarSfx from "../../../assets/acoustic_guitar.mp3";

export const DocumentMusic = () => {
  const { status, startMusic, stopMusic } = useDocumentMusic();
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);

  const audio = new Audio(acousticGuitarSfx);

  useEffect(() => {
    audio.addEventListener("canplaythrough", () => {
      setIsMusicLoaded(true);
    });

    if (isMusicLoaded) {
      if (status === MusicStatus.Active) {
        audio.loop = true;
        audio.play();
      } else {
        audio.pause();
      }
    }

    return () => {
      audio.removeEventListener("canplaythrough", () => {
        setIsMusicLoaded(true);
      });
    };
  }, [status, isMusicLoaded]);

  return (
    <div className="flex items-center justify-center gap-[2px] pr-1">
      <MusicSvg />
      <div className="cursor-pointer">
        {status === MusicStatus.Active ? (
          <PauseSvg className="w-4 h-4" onClick={stopMusic} />
        ) : (
          <PlaySvg
            className="w-4 h-4"
            onClick={() => startMusic(DEFAULT_MUSIC_ID)}
          />
        )}
      </div>
    </div>
  );
};
