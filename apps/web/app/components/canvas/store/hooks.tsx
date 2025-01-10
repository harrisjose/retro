import { updateProxyState } from "@retro/common";
import { useSectionMap } from "@retro/sdk";
import { omit } from "lodash-es";
import { useContext, useMemo } from "react";
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
