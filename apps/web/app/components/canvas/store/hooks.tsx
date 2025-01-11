import { updateProxyState } from "@retro/common";
import { useSectionMap } from "@retro/sdk";
import { omit } from "lodash-es";
import { type RefObject, useContext, useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import { CanvasContext } from "./provider.js";
import { type BlockToInsert, CanvasMode, type Point } from "./types.js";
import { computeZoomBounds, panCamera, zoomCamera } from "./utils.js";

export const useCanvas = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state);
  return omit(snap, ["camera"]);
};

export const useCamera = () => {
  const sections = useSectionMap();
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state.camera);

  const zBounds = useMemo(() => computeZoomBounds(sections), [sections]);

  return {
    camera: snap,
    zoomBy: (dz: number, origin: Point) => {
      updateProxyState(
        state.camera,
        zoomCamera(state.camera, origin, dz, zBounds),
      );
    },
    moveBy: (dx: number = 0, dy: number = 0) => {
      updateProxyState(state.camera, panCamera(state.camera, dx, dy));
    },
  };
};

export const useCanvasGestures = (
  ref: RefObject<HTMLElement | null>,
  {
    onPinch,
    onWheel,
    onClick,
  }: {
    onPinch: (event: WheelEvent) => void;
    onWheel: (event: WheelEvent) => void;
    onClick: (event: MouseEvent) => void;
  },
) => {
  // Ideally this would have been using hooks from useGesture, but it seems to be causing issues
  // with the pinch origin not being correct. UseGesture probably is doing some translation of the
  // event coordinates.
  // TODO @harris: Investigate later since useGesture has debouncing and other nice-ities built in.
  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.ctrlKey) {
      onPinch(event);
    } else {
      onWheel(event);
    }
  }

  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    console.log(target);
    if (
      target.getAttribute("data-clear-selection") &&
      !event?.defaultPrevented
    ) {
      onClick(event);
    }
  }

  useEffect(() => {
    const rootEl = ref.current;
    if (!rootEl) {
      throw new Error("Target element not found");
    }

    rootEl.addEventListener("wheel", handleWheel, { passive: false });
    rootEl.addEventListener("click", handleClick);
    return () => {
      if (rootEl) rootEl.removeEventListener("wheel", handleWheel);
      if (rootEl) rootEl.removeEventListener("click", handleClick);
    };
  }, [ref, onPinch, onWheel]);
};

export const useScale = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state.camera);
  return snap.z;
};

export const useInsertion = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state);

  const setBlockToInsert = (block: BlockToInsert | null) => {
    state.insertion.selectedBlock = block;
  };

  const setLastInsertedBlockId = (blockId: string) => {
    state.insertion.lastInsertedId = blockId;
  };

  return {
    blockToInsert: snap.insertion.selectedBlock,
    lastInsertedBlockId: snap.insertion.lastInsertedId,
    setBlockToInsert,
    setLastInsertedBlockId,
  };
};

export const useSelection = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state);

  const setSelection = (selection: string[]) => {
    state.mode = CanvasMode.Selected;
    state.selection = selection;
  };

  const clearSelection = () => {
    state.mode = CanvasMode.None;
    state.selection = [];
  };

  return { selection: snap.selection, setSelection, clearSelection };
};

export const useCanvasMode = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state);
  return snap.mode;
};
