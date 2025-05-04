"use client";
import { cn } from "@/lib/utils";
import type { SpringOptions } from "motion/react";
import { motion, useSpring } from "motion/react";
import { useEffect } from "react";

type CursorProps = {
  className?: string;
  x: number;
  y: number;
  color: {
    primary: string;
  };
  userName: string;
};

const springConfig: SpringOptions = {
  stiffness: 100,
  damping: 12,
  mass: 0.5,
};

export function CollaboratorCursor({
  className,
  x,
  y,
  color,
  userName,
}: CursorProps) {
  const cursorXSpring = useSpring(x, springConfig);
  const cursorYSpring = useSpring(y, springConfig);

  useEffect(() => {
    cursorXSpring.set(x);
    cursorYSpring.set(y);
  }, [x, y]);

  return (
    <motion.div
      className={cn("pointer-events-none fixed z-50", className)}
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <span className="pointer-events-none relative select-none">
        <svg
          aria-hidden="true"
          focusable="false"
          className="size-3.5"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path
            style={{ fill: color.primary }}
            d="M19.438 6.716 1.115.05A.832.832 0 0 0 .05 1.116L6.712 19.45a.834.834 0 0 0 1.557.025l3.198-8 7.995-3.2a.833.833 0 0 0 0-1.559h-.024Z"
          />
        </svg>
        <span
          className="relative ml-3.5 flex flex-col whitespace-nowrap rounded-xl py-1 pr-3 pl-2.5 text-xs"
          style={{
            backgroundColor: color.primary,
            color: "#fff",
          }}
        >
          <span>{userName}</span>
        </span>
      </span>
    </motion.div>
  );
}
