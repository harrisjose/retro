import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useDocumentTimer } from "@retro/sdk";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { CountdownTimer } from "./countdown-timer";

export const TimerMusicWrapper = () => {
  const {
    startTime,
    endTime,
    startTimer,
    pauseTimer,
    stopTimer,
    pausedAt,
    resumeTimer,
    incrementTimer,
    decrementTimer,
  } = useDocumentTimer();

  console.log("timer", startTime, endTime, pausedAt);
  const ActionButton = useMemo(() => {
    if (pausedAt) {
      return (
        <>
          <Button onClick={() => resumeTimer()}>Resume</Button>
          <Button onClick={() => stopTimer()}>Stop</Button>
        </>
      );
    }

    if (startTime && !pausedAt) {
      return (
        <>
          <Button onClick={() => pauseTimer()}>Pause</Button>
          <Button onClick={() => stopTimer()}>Stop</Button>
          <Button onClick={() => incrementTimer(60)}>+1m</Button>
          <Button onClick={() => decrementTimer(60)}>-1m</Button>
        </>
      );
    }

    return <Button onClick={() => startTimer(6 * 60)}>Start</Button>;
  }, [startTime, pausedAt]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {startTime && endTime ? (
          <div>
            <CountdownTimer
              startTime={startTime}
              endTime={endTime}
              pausedAt={pausedAt}
            />
          </div>
        ) : (
          <Button variant="ghost">06:00</Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="flex flex-col w-[360px] bg-black rounded-[12px] p-3">
        <div>{ActionButton}</div>
      </PopoverContent>
    </Popover>
  );
};
