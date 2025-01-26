import acousticGuitarSfx from "../../assets/acoustic-guitar.mp3";

import { DEFAULT_MUSIC_ID, MusicStatus, useDocumentMusic } from "@retro/sdk";
import { useEffect, useRef, useState } from "react";
import Music from "../svg/music";
import Pause from "../svg/pause";
import Play from "../svg/play";

export const DocumentMusic = () => {
  const { status, startMusic, stopMusic } = useDocumentMusic();
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio(acousticGuitarSfx));

  useEffect(() => {
    const onMusicLoaded = () => {
      setIsMusicLoaded(true);
    };

    audioRef.current.addEventListener("canplaythrough", onMusicLoaded);

    if (isMusicLoaded) {
      if (status === MusicStatus.Active) {
        audioRef.current.loop = true;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }

    return () => {
      audioRef.current.removeEventListener("canplaythrough", onMusicLoaded);
    };
  }, [status, isMusicLoaded]);

  return (
    <div className="flex items-center justify-center gap-[2px] pr-1">
      <Music />
      <div className="cursor-pointer">
        {status === MusicStatus.Active ? (
          <Pause className="w-4 h-4" onClick={stopMusic} />
        ) : (
          <Play
            className="w-4 h-4"
            onClick={() => startMusic(DEFAULT_MUSIC_ID)}
          />
        )}
      </div>
    </div>
  );
};
