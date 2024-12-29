import { cn } from "@/lib/utils";
import { CanvasConstants } from "@retro/common";
import { computeZoomBounds, useCamera, useSectionMap } from "@retro/sdk";
import { useGesture } from "@use-gesture/react";
import { useRef, useState } from "react";
import BlocksRenderer from "./blocks";
import CardCursor from "./card-cursor";
import SectionRenderer from "./section";
// import Zoom from "./zoom";

export default function Canvas() {
  const sections = useSectionMap();
  const { zoom, zoomTo, position, moveTo } = useCamera();
  const [zoomBounds, setZoomBounds] = useState({ min: 0.1, max: 1 });

  const canvasRootRef = useRef<HTMLDivElement>(null);
  const sectionRootRef = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onPinch: (state) => {
        state.event.preventDefault();
        const pinchOriginX = state.origin[0];
        const pinchOriginY = state.origin[1];
        const newScale = state.offset[0];

        // Initialize memo with initial conditions
        const memo = state.memo ?? {
          bounds: sectionRootRef.current!.getBoundingClientRect(),
          initial: {
            x: position.x,
            y: position.y,
            scale: zoom,
          },
        };

        // Calculate the transform origin (center of the element)
        const transformOriginX = memo.bounds.x + memo.bounds.width / 2;
        const transformOriginY = memo.bounds.y + memo.bounds.height / 2;

        // Calculate displacement from transform origin to pinch point
        const displacementX =
          (transformOriginX - pinchOriginX) / memo.initial.scale;
        const displacementY =
          (transformOriginY - pinchOriginY) / memo.initial.scale;

        // Calculate the scale change
        const scaleDelta = newScale - memo.initial.scale;

        // Update position based on displacement and scale change
        const newPosition = {
          x: memo.initial.x - displacementX * scaleDelta,
          y: memo.initial.y - displacementY * scaleDelta,
        };

        zoomTo(newScale);
        moveTo(newPosition);

        return memo;
      },
      onWheel: (state) => {
        state.event.preventDefault();

        moveTo({
          x: state.offset[0],
          y: state.offset[1],
        });
      },
    },
    {
      eventOptions: { passive: false },
      target: canvasRootRef,
      pinch: {
        from: () => [zoom, 0],
        scaleBounds: () => {
          const bounds = computeZoomBounds(sections);
          setZoomBounds(bounds);
          return bounds;
        },
      },
      wheel: {
        from: () => [position.x, position.y],
      },
    }
  );

  return (
    <>
      <div
        ref={canvasRootRef}
        id="canvas-root"
        className="absolute top-0 left-0 w-full h-full z-0 touch-none flex items-center justify-start bg-[#FAF8F6]"
      >
        <div
          id="canvas-scale-wrapper"
          ref={sectionRootRef}
          style={{
            transform: `scale(${zoom})`,
            left: -position.x,
            top: -position.y,
            transformOrigin: "center center",
            gap: CanvasConstants.PaddingBetween,
            padding: CanvasConstants.PaddingAround,
          }}
          className={cn("flex w-fit overflow-visible absolute")}
        >
          {Object.keys(sections).map((sectionId) => (
            <SectionRenderer key={sectionId} id={sectionId} />
          ))}
          <BlocksRenderer />
        </div>
        <CardCursor />
      </div>
      {/* <Zoom
        value={{ min: zoomBounds.min, max: zoomBounds.max, current: zoom }}
        onChange={zoomTo}
      /> */}
    </>
  );
}
