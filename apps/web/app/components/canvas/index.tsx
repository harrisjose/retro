import { cn } from "@/lib/utils";
import { CanvasConstants } from "@retro/common";
import { useSectionMap } from "@retro/sdk";
import { useEffect, useRef } from "react";
import BlocksRenderer from "./blocks";
import { CanvasCursor } from "./canvas-cursor";
import IntroSection from "./intro";
import SectionRenderer from "./section";
import { useCamera } from "./store";
import SummarySection from "./summary";
import Zoom from "./zoom";

export default function Canvas() {
  const sections = useSectionMap();
  const { camera, zoomBy, moveBy } = useCamera();

  const canvasRootRef = useRef<HTMLDivElement>(null);
  const sectionRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();

      const { clientX, clientY, deltaX, deltaY, ctrlKey } = event;
      console.log({ clientX, clientY, deltaX, deltaY, ctrlKey });

      if (ctrlKey) {
        zoomBy(deltaY / 100, { x: clientX, y: clientY });
      } else {
        moveBy(deltaX, deltaY);
      }
    }

    const rootEl = canvasRootRef.current;
    if (!rootEl) {
      throw new Error("Canvas root element not found");
    }

    rootEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (rootEl) rootEl.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRootRef, zoomBy, moveBy]);

  return (
    <>
      <div
        ref={canvasRootRef}
        id="canvas-root"
        className="absolute top-0 left-0 w-screen h-screen z-0 touch-none bg-[#F5F5F5]"
      >
        <div
          id="canvas-scale-wrapper"
          ref={sectionRootRef}
          className={cn("absolute flex w-fit overflow-visible")}
          style={{
            transform: `scale(${camera.z}) translate(${camera.x}px, ${camera.y}px)`,
            transformOrigin: "0 0",
            gap: CanvasConstants.PaddingBetween,
            padding: CanvasConstants.PaddingAround,
          }}
        >
          <IntroSection />
          {Object.keys(sections).map((sectionId) => (
            <SectionRenderer key={sectionId} id={sectionId} />
          ))}
          <BlocksRenderer />
          <SummarySection />
        </div>
        <CanvasCursor />
      </div>
      <Zoom current={camera.z} onChange={zoomBy} />
    </>
  );
}
