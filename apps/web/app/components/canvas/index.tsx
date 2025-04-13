import { cn } from "@/lib/utils";
import { CanvasConstants } from "@retro/common";
import { useSectionMap } from "@retro/sdk";
import { useRef } from "react";
import BlocksRenderer from "./blocks";
import { CanvasCursor } from "./cursors/canvas-cursor";
import { UserCursor } from "./cursors/user-cursor";
import {
  BlockEventType,
  CanvasControllerContext,
  CanvasEventType,
} from "./machine";
import IntroSection from "./sections/intro";
import SectionRenderer from "./sections/section";
import SummarySection from "./sections/summary";
import { SelectionRectangle } from "./selection-rect";
import { screenToCanvas, useCamera, useCanvasGestures } from "./store";
import Zoom from "./zoom-menu";

export default function Canvas() {
  const { sections } = useSectionMap();
  const { camera, zoomBy, moveBy } = useCamera();

  const canvasRootRef = useRef<HTMLDivElement>(null);
  const sectionRootRef = useRef<HTMLDivElement>(null);
  const controller = CanvasControllerContext.useActorRef();

  useCanvasGestures(canvasRootRef, {
    onPinch: (event) => {
      const { clientX, clientY, deltaY } = event;
      zoomBy(deltaY / 100, { x: clientX, y: clientY });
    },
    onWheel: (event) => {
      const { deltaX, deltaY } = event;
      moveBy(deltaX, deltaY);
    },
    onDragStart(event) {
      const point = screenToCanvas(
        { x: event.clientX, y: event.clientY },
        camera,
      );
      controller.send({
        type: CanvasEventType.CanvasDragStart,
        payload: {
          x: point.x,
          y: point.y,
          shiftKey: event.shiftKey,
        },
      });
    },
    onDrag(event) {
      const point = screenToCanvas(
        { x: event.clientX, y: event.clientY },
        camera,
      );
      controller.send({
        type: CanvasEventType.CanvasDrag,
        payload: {
          x: point.x,
          y: point.y,
          shiftKey: event.shiftKey,
        },
      });
    },
    onDragEnd(event) {
      const point = screenToCanvas(
        { x: event.clientX, y: event.clientY },
        camera,
      );
      controller.send({
        type: CanvasEventType.CanvasDragEnd,
        payload: {
          x: point.x,
          y: point.y,
          shiftKey: event.shiftKey,
        },
      });
    },
    onClick: () => {
      controller.send({ type: CanvasEventType.CanvasClick });
    },
  });

  // const [machineState, context] = CanvasControllerContext.useSelector(
  //   (state) => [state.value, state.context],
  // );

  // console.debug(
  //   JSON.stringify(machineState, null, 2),
  //   JSON.stringify(context, null, 2),
  // );

  const onDuplicate = (blockId: string) => {
    controller.send({
      type: BlockEventType.BlockDuplicate,
      blockId,
    });
  };

  const onDelete = (blockId: string) => {
    controller.send({
      type: BlockEventType.BlockDelete,
      blockId,
    });
  };

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
          }}
        >
          <IntroSection />
          {Object.keys(sections).map((sectionId) => (
            <SectionRenderer key={sectionId} id={sectionId} />
          ))}
          <SummarySection />

          <BlocksRenderer onDuplicate={onDuplicate} onDelete={onDelete} />

          <UserCursor />
        </div>
        <CanvasCursor />
        <SelectionRectangle />
      </div>
      <Zoom current={camera.z} onChange={zoomBy} />
    </>
  );
}
