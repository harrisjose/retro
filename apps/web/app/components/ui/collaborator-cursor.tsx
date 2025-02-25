"use client";
import { cn } from "@/lib/utils";
import type { SpringOptions } from "motion/react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

type CursorProps = {
  className?: string;
  x: number;
  y: number;
  color: {
    background: string;
    text: string;
  };
};

const springConfig: SpringOptions = {
  stiffness: 0,
  damping: 15,
  mass: 1,
};

export function CollaboratorCursor({ className, x, y, color }: CursorProps) {
  const cursorX = useMotionValue(x);
  const cursorY = useMotionValue(y);

  useEffect(() => {
    cursorX.set(x);
    cursorY.set(y);
  }, [x, y, cursorX, cursorY]);

  const cursorXSpring = useSpring(cursorX, springConfig || { duration: 0 });
  const cursorYSpring = useSpring(cursorY, springConfig || { duration: 0 });

  return (
    <motion.div
      className={cn("pointer-events-none fixed z-50", className)}
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <span className={cn("pointer-events-none relative select-none")}>
        <svg
          aria-hidden="true"
          focusable="false"
          className={cn("size-3.5")}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path
            style={{ fill: color.text }}
            d="M19.438 6.716 1.115.05A.832.832 0 0 0 .05 1.116L6.712 19.45a.834.834 0 0 0 1.557.025l3.198-8 7.995-3.2a.833.833 0 0 0 0-1.559h-.024Z"
          />
        </svg>
        <span
          className={cn(
            "relative ml-3.5 flex flex-col whitespace-nowrap rounded-xl py-1 pr-3 pl-2.5 text-xs",
          )}
          style={{
            backgroundColor: color.background,
            color: color.text,
          }}
        >
          <span>Praveen kumar</span>
        </span>
      </span>
    </motion.div>
  );
}
