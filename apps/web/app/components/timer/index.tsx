import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useDocumentTimer } from "@retro/sdk";
import ArrowDown from "../svg/arrow-down";
import Timer from "../svg/timer";
import { CountdownTimer } from "./countdown-timer";
import CountdownTimerEditor from "./countdown-timer-editor";

export const DocumentTimerWrapper = () => {
  const { status } = useDocumentTimer();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-center gap-1 cursor-pointer px-5 hover:bg-insertionHover h-full group">
          {status === "active" || status === "paused" ? (
            <CountdownTimer />
          ) : (
            <Timer className="group-hover:scale-[120%] transition-transform duration-200" />
          )}
          <ArrowDown />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[190px] bg-white p-4 rounded-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)]"
        sideOffset={20}
        align="center"
        alignOffset={10}
      >
        <CountdownTimerEditor />
      </PopoverContent>
    </Popover>
  );
};
