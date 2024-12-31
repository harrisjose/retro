import { useEffect, useState } from "react";

interface CountdownProps {
  startTime: string; // UTC string
  endTime: string; // UTC string
  pausedAt: string | null;
}

export const CountdownTimer = ({
  startTime,
  endTime,
  pausedAt,
}: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Calculate initial time difference in milliseconds
    const currentTime = pausedAt
      ? new Date(pausedAt).getTime()
      : new Date().getTime();
    const end = new Date(endTime).getTime();
    const initialDiff = Math.max(0, end - currentTime);

    setTimeLeft(Math.floor(initialDiff / 1000)); // Convert to seconds

    // Only set up interval if not paused
    if (!pausedAt) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [endTime, pausedAt]); // Add pausedAt to dependencies

  // Convert seconds to minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div>
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};
