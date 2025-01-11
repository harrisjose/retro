import { cn } from "@/lib/utils";
import { CanvasConstants } from "@retro/common";
import { useSectionMap } from "@retro/sdk";
import { useRef } from "react";
import BlocksRenderer from "./blocks";
import { CanvasCursor } from "./canvas-cursor";
import IntroSection from "./intro";
import SectionRenderer from "./section";
import { useCamera, useCanvasGestures, useSelection } from "./store";
import SummarySection from "./summary";
import Zoom from "./zoom";

export default function Canvas() {
  const sections = useSectionMap();
  const { camera, zoomBy, moveBy } = useCamera();
  const { clearSelection } = useSelection();

  const canvasRootRef = useRef<HTMLDivElement>(null);
  const sectionRootRef = useRef<HTMLDivElement>(null);

  useCanvasGestures(canvasRootRef, {
    onPinch: (event) => {
      const { clientX, clientY, deltaY } = event;
      zoomBy(deltaY / 100, { x: clientX, y: clientY });
    },
    onWheel: (event) => {
      const { deltaX, deltaY } = event;
      moveBy(deltaX, deltaY);
    },
    onClick: () => clearSelection(),
  });

  return (
    <>
      <div
        ref={canvasRootRef}
        id="canvas-root"
        className="absolute top-0 left-0 w-screen h-screen z-0 touch-none bg-[#F5F5F5]"
        data-clear-selection
      >
        <div
          id="canvas-scale-wrapper"
          ref={sectionRootRef}
          className={cn("absolute flex w-fit overflow-visible")}
          data-clear-selection
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
