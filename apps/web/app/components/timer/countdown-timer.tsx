import { useDocumentTimer } from "@retro/sdk";
import { useEffect, useMemo, useState } from "react";

import timerCompleteSfx from "../../assets/timer-complete.mp3";

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { endTime, pausedAt, status, resetTimer } = useDocumentTimer();

  const timerCompleteAudio = new Audio(timerCompleteSfx);

  useEffect(() => {
    if (status === "inactive") {
      return;
    }

    // Calculate initial time difference
    const currentTime = status === "paused" ? new Date(pausedAt!) : new Date();
    const end = new Date(endTime!);
    const initialDiff = Math.max(0, end.getTime() - currentTime.getTime());

    setTimeLeft(Math.floor(initialDiff / 1000));

    // Only set up interval if not paused
    if (pausedAt) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setTimeout(() => {
            resetTimer();
            timerCompleteAudio.play();
            // TODO - stop music when timer ends
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, pausedAt, status, resetTimer]);

  const [minutes, seconds] = useMemo(() => {
    const mins = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");
    return [mins, secs];
  }, [timeLeft]);

  return (
    <div>
      {minutes}:{seconds}
    </div>
  );
};
