"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

type CursorProps = {
  children: React.ReactNode;
  className?: string;
  attachToParent?: boolean;
  cursorType: "grabbing" | "auto";
};

export function Cursor({
  children,
  className,
  attachToParent,
  cursorType,
}: CursorProps) {
  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!attachToParent);

  useEffect(() => {
    if (!attachToParent) {
      document.body.style.cursor = "none";
    } else {
      document.body.style.cursor = "auto";
    }

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const controller = new AbortController();

    document.addEventListener("mousemove", updatePosition, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [attachToParent]);

  useEffect(() => {
    const handleVisibilityChange = (visible: boolean) => {
      setIsVisible(visible);
    };

    if (attachToParent && cursorRef.current) {
      const parent = cursorRef.current.parentElement;
      if (parent) {
        parent.addEventListener("mouseenter", () => {
          parent.style.cursor = cursorType;
          handleVisibilityChange(true);
        });
        parent.addEventListener("mouseleave", () => {
          parent.style.cursor = cursorType;
          handleVisibilityChange(false);
        });
      }
    }

    return () => {
      if (attachToParent && cursorRef.current) {
        const parent = cursorRef.current.parentElement;
        if (parent) {
          parent.removeEventListener("mouseenter", () => {
            parent.style.cursor = cursorType;
            handleVisibilityChange(true);
          });
          parent.removeEventListener("mouseleave", () => {
            parent.style.cursor = cursorType;
            handleVisibilityChange(false);
          });
        }
      }
    };
  }, [attachToParent]);

  return (
    <div
      ref={cursorRef}
      className={cn("pointer-events-none fixed left-0 top-0 z-50 ", className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
      }}
    >
      {isVisible && children}
    </div>
  );
}
