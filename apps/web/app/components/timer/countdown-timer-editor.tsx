import { DEFAULT_TIMER_SECONDS, useDocumentTimer } from "@retro/sdk";
import { useEffect, useRef } from "react";
import MinusSVG from "../svg/minus.svg?react";
import PauseSvg from "../svg/pause.svg?react";
import PlaySvg from "../svg/play.svg?react";
import PlusSVG from "../svg/plus.svg?react";
import { Button } from "../ui/button";

const formatTimer = (value: string) =>
  (parseInt(value) || 0).toString().padStart(2, "0");

const TimerActionButtons = ({
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

  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!minutesRef.current || !secondsRef.current) return;

    const updateTimerDisplay = (totalSeconds: number) => {
      minutesRef.current!.value = formatTimer(
        Math.floor(totalSeconds / 60).toString(),
      );
      secondsRef.current!.value = formatTimer((totalSeconds % 60).toString());
    };

    if (status === "inactive") {
      updateTimerDisplay(DEFAULT_TIMER_SECONDS);
      return;
    }

    const currentTime = status === "paused" ? new Date(pausedAt!) : new Date();
    const end = new Date(endTime!);
    const totalSeconds = Math.max(
      0,
      Math.floor((end.getTime() - currentTime.getTime()) / 1000),
    );

    updateTimerDisplay(totalSeconds);

    if (status !== "active") return;

    const interval = setInterval(() => {
      const currentTime = new Date();
      const end = new Date(endTime!);
      const totalSeconds = Math.max(
        0,
        Math.floor((end.getTime() - currentTime.getTime()) / 1000),
      );

      if (totalSeconds <= 0) {
        clearInterval(interval);
        updateTimerDisplay(0);
        return;
      }

      updateTimerDisplay(totalSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, pausedAt, status]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMinutes: boolean,
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    const minutesInput = minutesRef.current;
    const secondsInput = secondsRef.current;

    if (!minutesInput || !secondsInput) return;

    // Do all the validations and input focus switch when 2 digits are entered
    if (value.length === 2) {
      const numValue = parseInt(value);

      if (isMinutes) {
        // After typing 2 digits in minutes, focus on seconds input
        minutesInput.value = Math.min(99, numValue).toString().padStart(2, "0");
        secondsInput.focus();
        secondsInput.setSelectionRange(0, secondsInput.value.length);
      } else {
        // If the seconds input is greater than 60, add the extra minutes to the minutes input
        if (numValue >= 60) {
          const extraMinutes = Math.floor(numValue / 60);
          const remainingSeconds = numValue % 60;
          const newMinutes = Math.min(
            99,
            (parseInt(minutesInput.value) || 0) + extraMinutes,
          )
            .toString()
            .padStart(2, "0");
          minutesInput.value = newMinutes;
          secondsInput.value = remainingSeconds.toString().padStart(2, "0");
        } else {
          secondsInput.value = numValue.toString().padStart(2, "0");
        }
      }
    } else {
      // For single digit input
      if (isMinutes) {
        minutesInput.value = value;
      } else {
        secondsInput.value = value;
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isMinutes: boolean,
  ) => {
    const input = e.target as HTMLInputElement;
    const isAtEnd = input.selectionStart === input.value.length;
    const isAtStart = input.selectionStart === 0;

    // This is to switch the focus between minutes and seconds when using arrow keys
    if (
      (e.key === "ArrowRight" && isAtEnd && isMinutes) ||
      (e.key === "ArrowLeft" && isAtStart && !isMinutes) ||
      (e.key === "Backspace" && isAtStart && !isMinutes)
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
    if (!minutesRef.current || !secondsRef.current) return;
    const totalSeconds =
      parseInt(minutesRef.current.value) * 60 +
      parseInt(secondsRef.current.value);
    if (totalSeconds > 0) {
      startTimer(totalSeconds);
    }
  };

  const handleIncrement = () => {
    if (status === "active" || status === "paused") {
      incrementTimer(60);
    } else if (minutesRef.current) {
      const newMinutes = (parseInt(minutesRef.current.value) || 0) + 1;
      minutesRef.current.value = formatTimer(
        Math.min(99, newMinutes).toString(),
      );
    }
  };

  const handleDecrement = () => {
    if (status === "active" || status === "paused") {
      decrementTimer(60);
    } else if (minutesRef.current) {
      const newMinutes = (parseInt(minutesRef.current.value) || 0) - 1;
      minutesRef.current.value = formatTimer(
        Math.max(0, newMinutes).toString(),
      );
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
            ref={minutesRef}
            type="text"
            onChange={(e) => handleInputChange(e, true)}
            onKeyDown={(e) => handleKeyDown(e, true)}
            onBlur={(e) => (e.target.value = formatTimer(e.target.value))}
            disabled={status === "active" || status === "paused"}
            className="w-[39px] text-center outline-none border-none bg-transparent text-[32px] leading-9"
          />
          <span className="text-[32px] leading-9">:</span>
          <input
            ref={secondsRef}
            type="text"
            onChange={(e) => handleInputChange(e, false)}
            onKeyDown={(e) => handleKeyDown(e, false)}
            disabled={status === "active" || status === "paused"}
            onBlur={(e) => (e.target.value = formatTimer(e.target.value))}
            className="w-[39px] text-center outline-none border-none bg-transparent text-[32px] leading-9"
          />
        </div>
        <button onClick={handleIncrement} className="outline-none">
          <PlusSVG className="fill-primary" />
        </button>
      </div>
      <TimerActionButtons
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
