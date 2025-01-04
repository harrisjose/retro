import { DEFAULT_MUSIC_ID, useDocumentMusic } from "@retro/sdk";
import useSound from "use-sound";
import MusicSvg from "../svg/music.svg?react";
import PauseSvg from "../svg/pause.svg?react";
import PlaySvg from "../svg/play.svg?react";

import { useEffect } from "react";
import acousticGuitarSfx from "../../../assets/acoustic_guitar.mp3";

export const DocumentMusic = () => {
  const { status, startMusic, stopMusic } = useDocumentMusic();
  const [play, { stop }] = useSound(acousticGuitarSfx, {
    volume: 0.05,
    loop: true,
    interrupt: true,
  });

  useEffect(() => {
    if (status === "active") {
      play();
    } else {
      stop();
    }
  }, [status, play, stop]);

  return (
    <div className="flex items-center justify-center gap-1 pr-1">
      <MusicSvg />
      <div className="cursor-pointer">
        {status === "active" ? (
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
