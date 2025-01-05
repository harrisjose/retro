import { DEFAULT_MUSIC_ID, MusicStatus, useDocumentMusic } from "@retro/sdk";
import useSound from "use-sound";
import MusicSvg from "../svg/music.svg?react";
import PauseSvg from "../svg/pause.svg?react";
import PlaySvg from "../svg/play.svg?react";

import { useEffect, useState } from "react";
import acousticGuitarSfx from "../../../assets/acoustic_guitar.mp3";

export const DocumentMusic = () => {
  const { status, startMusic, stopMusic } = useDocumentMusic();
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);

  const [play, { stop }] = useSound(acousticGuitarSfx, {
    volume: 0.2,
    loop: true,
    interrupt: true,

    onload: () => {
      setIsMusicLoaded(true);
    },
  });

  useEffect(() => {
    if (isMusicLoaded) {
      if (status === MusicStatus.Active) {
        console.log("music is active");
        play();
      } else {
        console.log("music is not active");
        stop();
      }
    }
  }, [status, play, stop, isMusicLoaded]);

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
