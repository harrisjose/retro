import { cn } from "@/lib/utils";
import { useProfile } from "@retro/sdk/src/profile";
import { format } from "date-fns";
import { useCallback } from "react";
import BaloonOutlineSvg from "../svg/balloon-outline";
import Calendar from "../svg/calendar";
import type { RetroFormData } from "./retro-form";

type RetroGcalIntegrationProps = {
  retroData: RetroFormData;
};

const RetroGcalIntegration = ({ retroData }: RetroGcalIntegrationProps) => {
  const { profile } = useProfile();

  const createGCalEventUrl = useCallback(() => {
    if (!retroData.endDate) return "";

    // Get date string in YYYY-MM-DD format
    const dateStr = format(retroData.endDate, "yyyy-MM-dd");

    // Format for Google Calendar
    const formatTimeForGCal = (timeStr: string) => {
      // Replace : with nothing
      return timeStr.replace(":", "");
    };

    // Create dates in YYYYMMDDTHHMMSS format (local time)
    const startDateTime = `${dateStr.replace(/-/g, "")}T${formatTimeForGCal(retroData.startTime)}00`;
    const endDateTime = `${dateStr.replace(/-/g, "")}T${formatTimeForGCal(retroData.endTime)}00`;

    // Build URL parameters
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: retroData.name || "Retro Meeting",
      dates: `${startDateTime}/${endDateTime}`,
      details: "Retrospective meeting created with Retro App",
      ctz: profile.timezone, // Set calendar timezone
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [
    retroData.endDate,
    retroData.startTime,
    retroData.endTime,
    profile.timezone,
  ]);

  return (
    <div className="flex flex-col gap-16 mt-16">
      <div className="flex flex-col gap-3 px-[45px] items-center">
        <BaloonOutlineSvg className="w-[50px] h-[50px] -rotate-[24deg]" />
        <p className="text-white font-bold text-xl text-center">
          Retro has been created successfully!
        </p>
      </div>
      <a
        role="button"
        href={createGCalEventUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "bg-white text-black hover:bg-white hover:text-black transition-colors",
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed",
          "h-10 px-4 py-2",
        )}
      >
        Add to Calendar
        <Calendar className="w-4 h-4 ml-[14px]" />
      </a>
    </div>
  );
};

export { RetroGcalIntegration };
