import { toDate, toZonedTime } from "date-fns-tz";
/**
 * Formats duration in minutes to a human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "30 mins", "1 hr", "1.5 hrs"
 */
const formatDurationLabel = (minutes: number): string => {
  if (minutes === 0) return "0 mins";
  if (minutes < 60) return `${minutes} mins`;
  const hours = minutes / 60;
  return Number.isInteger(hours)
    ? `${hours} hr${hours > 1 ? "s" : ""}`
    : `${hours.toFixed(1)} hrs`;
};

type GetTimeIntervalsProps = {
  intervalLength: number;
  intervalDuration: number;
  startMinutes?: number;
  showDuration?: boolean;
  durationOffset?: number;
};

/**
 * Generates time intervals with formatted labels
 * @param intervalLength - Number of intervals to generate
 * @param intervalDuration - Duration of each interval in minutes
 * @param startMinutes - Starting time in minutes
 * @param durationOffset - Initial duration offset in minutes
 * @returns Array of time intervals with values and formatted labels
 */

export const getTimeIntervals = ({
  intervalLength,
  intervalDuration,
  startMinutes = 0,
  showDuration = false,
  durationOffset = 0,
}: GetTimeIntervalsProps) => {
  return Array.from({ length: intervalLength }, (_, index) => {
    // Calculate time
    const minutes = index * intervalDuration + startMinutes;
    let hours = Math.floor(minutes / 60);
    if (hours >= 24) {
      hours = hours % 24;
    }
    const mins = minutes % 60;
    const label = new Date(0, 0, 0, hours, mins).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Calculate duration label
    const durationMins = minutes - startMinutes + durationOffset;
    const durationLabel = showDuration ? formatDurationLabel(durationMins) : "";

    return {
      value: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
      label: `${label} ${durationLabel ? `(${durationLabel})` : ""}`,
    };
  });
};

/**
 * Generates end time intervals based on a start time
 * First hour: 15-minute intervals
 * Remaining: 30-minute intervals
 * @param startTime - Start time in "HH:mm" format
 * @returns Combined array of time intervals with duration labels
 */
export const getEndTimeIntervals = (startTime: string) => {
  // Convert start time to minutes since midnight
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;

  // Generate first hour intervals (15-min)
  const firstHourIntervals = getTimeIntervals({
    intervalLength: 4,
    intervalDuration: 15,
    startMinutes,
    showDuration: true,
  });

  // Calculate remaining intervals until next day same time
  const remainingIntervals = getTimeIntervals({
    // -1 hour because first hour is covered
    intervalLength: (24 - 1) * 2,
    intervalDuration: 30,
    startMinutes: startMinutes + 60,
    showDuration: true,
    durationOffset: 60, // Start from 1 hour
  });

  return [...firstHourIntervals, ...remainingIntervals];
};

export const removeDurationLabel = (label: string) => {
  return label.split(" (")[0];
};

export const getDuration = (startTime: string, endTime: string) => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  return endTotalMinutes - startTotalMinutes;
};

/**
 * Gets the current time rounded to nearest 15 minutes and an end time 1 hour later
 * @returns Object with formatted start and end times
 */
export const getStartAndEndTime = (userTimezone?: string) => {
  const nowInUserTimezone = userTimezone
    ? toZonedTime(new Date(), userTimezone)
    : new Date();
  // Round current time to nearest 15 minutes
  const minutes = Math.ceil(nowInUserTimezone.getMinutes() / 15) * 15;
  nowInUserTimezone.setMinutes(minutes, 0, 0);

  // Create end time 1 hour later
  const later = new Date(nowInUserTimezone.getTime() + 60 * 60 * 1000);

  // Format times as HH:MM
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours >= 24) {
      hours = hours % 24;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  return {
    startTime: formatTime(nowInUserTimezone),
    endTime: formatTime(later),
  };
};

export { toDate, toZonedTime };
