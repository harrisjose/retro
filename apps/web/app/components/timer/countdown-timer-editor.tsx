import { DEFAULT_TIMER_SECONDS, useDocumentTimer } from "@retro/sdk";
import { useEffect, useState } from "react";
import MinusSVG from "../svg/minus.svg?react";
import PauseSvg from "../svg/pause.svg?react";
import PlaySvg from "../svg/play.svg?react";
import PlusSVG from "../svg/plus.svg?react";
import { Button } from "../ui/button";

const formatTimer = (value: string) =>
  (parseInt(value) || 0).toString().padStart(2, "0");

const CountDownTimerActionButtons = ({
  status,
  startTimer,
  resumeTimer,
  stopTimer,
  pauseTimer,
}: {
  status: "inactive" | "paused" | "active";
  startTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
}) => {
  return (
    <div className="flex gap-2 w-full justify-between">
      {status === "inactive" && (
        <Button onClick={() => startTimer()} className="flex-1">
          Start
        </Button>
      )}
      {status === "paused" && (
        <>
          <Button onClick={() => resumeTimer()} className="bg-muted">
            <PlaySvg />
          </Button>
          <Button onClick={() => stopTimer()} className="bg-destructive flex-1">
            Stop
          </Button>
        </>
      )}
      {status === "active" && (
        <>
          <Button onClick={() => pauseTimer()} className="bg-muted">
            <PauseSvg />
          </Button>
          <Button onClick={() => stopTimer()} className="bg-destructive flex-1">
            Stop
          </Button>
        </>
      )}
    </div>
  );
};

const CountdownTimerEditor = () => {
  const {
    endTime,
    pausedAt,
    incrementTimer,
    decrementTimer,
    status,
    startTimer,
    resumeTimer,
    stopTimer,
    pauseTimer,
  } = useDocumentTimer();

  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

  useEffect(() => {
    if (status === "inactive") {
      setMinutes(
        formatTimer(Math.floor(DEFAULT_TIMER_SECONDS / 60).toString())
      );
      setSeconds(formatTimer((DEFAULT_TIMER_SECONDS % 60).toString()));
      return;
    }

    const currentTime = status === "paused" ? new Date(pausedAt!) : new Date();
    const end = new Date(endTime!);
    const totalSeconds = Math.max(
      0,
      Math.floor((end.getTime() - currentTime.getTime()) / 1000)
    );

    setMinutes(formatTimer(Math.floor(totalSeconds / 60).toString()));
    setSeconds(formatTimer((totalSeconds % 60).toString()));

    if (status === "active") {
      const interval = setInterval(() => {
        const mins = parseInt(minutes) || 0;
        const secs = parseInt(seconds) || 0;
        const totalSecs = mins * 60 + secs - 1;

        if (totalSecs <= 0) {
          clearInterval(interval);
          setMinutes("00");
          setSeconds("00");
          return;
        }

        setMinutes(formatTimer(Math.floor(totalSecs / 60).toString()));
        setSeconds(formatTimer((totalSecs % 60).toString()));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [endTime, pausedAt, status]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMinutes: boolean
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    const num =
      value === ""
        ? ""
        : Math.min(isMinutes ? 99 : 59, parseInt(value)).toString();
    isMinutes ? setMinutes(num) : setSeconds(num);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isMinutes: boolean
  ) => {
    const input = e.target as HTMLInputElement;
    const isAtEnd = input.selectionStart === input.value.length;
    const isAtStart = input.selectionStart === 0;

    if (
      (e.key === "ArrowRight" && isAtEnd && isMinutes) ||
      (e.key === "ArrowLeft" && isAtStart && !isMinutes)
    ) {
      e.preventDefault();
      const siblingInput = isMinutes
        ? (input.nextElementSibling?.nextElementSibling as HTMLInputElement)
        : (input.previousElementSibling
            ?.previousElementSibling as HTMLInputElement);

      if (siblingInput) {
        siblingInput.focus();
        siblingInput.setSelectionRange(0, siblingInput.value.length);
      }
    }
  };

  const onStartTimer = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    if (totalSeconds > 0) {
      startTimer(totalSeconds);
    }
  };

  const handleIncrement = () => {
    if (status === "active") {
      incrementTimer(60);
    } else {
      const newMinutes = (parseInt(minutes) || 0) + 1;
      setMinutes(formatTimer(Math.min(99, newMinutes).toString()));
    }
  };

  const handleDecrement = () => {
    if (status === "active") {
      decrementTimer(60);
    } else {
      const newMinutes = (parseInt(minutes) || 0) - 1;
      setMinutes(formatTimer(Math.max(0, newMinutes).toString()));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-[14px]">
        <button onClick={handleDecrement} className="outline-none">
          <MinusSVG className="fill-primary" />
        </button>
        <div className="flex items-center gap-1 border-b border-dotted border-gray-300">
          <input
            type="text"
            value={minutes}
            onChange={(e) => handleInputChange(e, true)}
            onKeyDown={(e) => handleKeyDown(e, true)}
            onBlur={(e) => (e.target.value = formatTimer(minutes))}
            disabled={status === "active"}
            className="w-[39px] text-center outline-none border-none bg-transparent text-[32px] leading-9"
          />
          <span className="text-[32px] leading-9">:</span>
          <input
            type="text"
            value={seconds}
            onChange={(e) => handleInputChange(e, false)}
            onKeyDown={(e) => handleKeyDown(e, false)}
            onBlur={(e) => (e.target.value = formatTimer(seconds))}
            disabled={status === "active"}
            className="w-[39px] text-center outline-none border-none bg-transparent text-[32px] leading-9"
          />
        </div>
        <button onClick={handleIncrement} className="outline-none">
          <PlusSVG className="fill-primary" />
        </button>
      </div>
      <CountDownTimerActionButtons
        status={status as "inactive" | "paused" | "active"}
        startTimer={onStartTimer}
        resumeTimer={resumeTimer}
        stopTimer={stopTimer}
        pauseTimer={pauseTimer}
      />
    </div>
  );
};

export default CountdownTimerEditor;
