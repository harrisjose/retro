import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  formatDistanceToNow,
  isAfter,
} from "date-fns";

export const getRelativeTime = (date: Date): string => {
  const distance = formatDistanceToNow(date, { addSuffix: true });
  // Optional: customize very recent times
  if (Date.now() - date.getTime() < 60000) {
    // less than 1 minute
    return "just now";
  }
  return distance;
};

export const getRemainingTime = (date: Date): string => {
  const now = new Date();

  if (!isAfter(date, now)) return "";

  const daysRemaining = differenceInDays(date, now);
  const hoursRemaining = differenceInHours(date, now);

  if (daysRemaining > 1 || hoursRemaining > 24) return "";
  if (hoursRemaining > 0) return `${hoursRemaining} hrs`;

  const minutesRemaining = differenceInMinutes(date, now);
  return `${minutesRemaining} mins`;
};

export const getFormattedStartDate = (date: Date): Date => {
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getFormattedEndDate = (date: Date): Date => {
  date.setHours(23, 59, 59, 999);
  return date;
};
