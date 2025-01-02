import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useDocumentTimer } from "@retro/sdk";
import ArrowDown from "../svg/arrow-down.svg?react";
import TimerSvg from "../svg/timer.svg?react";
import { CountdownTimer } from "./countdown-timer";
import CountdownTimerEditor from "./countdown-timer-editor";

export const DocumentTimerWrapper = () => {
  const { status } = useDocumentTimer();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-center gap-1">
          <TimerSvg />

          {status === "active" || status === "paused" ? (
            <CountdownTimer />
          ) : (
            <></>
          )}
          <ArrowDown />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[190px] bg-white p-4 rounded-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)]"
        sideOffset={10}
        align={"start"}
      >
        <CountdownTimerEditor />
      </PopoverContent>
    </Popover>
  );
};
