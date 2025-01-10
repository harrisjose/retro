import { updateProxyState } from "@retro/common";
import { useReadyStatus, useSectionMap } from "@retro/sdk";
import { omit } from "lodash-es";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { proxy, useSnapshot } from "valtio";
import type { BlockToInsert, CanvasState } from "./types.js";
import { computeInitialPosition, computeInitialZoom } from "./utils.js";

const CanvasContext = createContext<CanvasState>({} as any);

export const CanvasProvider = ({
  id,
  children,
}: PropsWithChildren<{ id: string }>) => {
  const state = useRef(
    proxy<CanvasState>({
      id: id,
      camera: {
        scale: computeInitialZoom(),
        position: {
          x: 0,
          y: 0,
        },
      },
      blockToInsert: null,
      lastInsertedBlockId: null,
      // TODO: Use this for all calculations
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }),
  ).current;

  const isReady = useReadyStatus();
  const sections = useSectionMap();

  useEffect(() => {
    console.log("camera init");
    updateProxyState(
      state.camera.position,
      computeInitialPosition(state.camera.scale, sections),
    );
  }, [isReady]);

  useLayoutEffect(() => {
    const handleResize = () => {
      updateProxyState(state.viewport, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <CanvasContext.Provider value={state}>{children}</CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state);
  return omit(snap, ["camera"]);
};

export const useCamera = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state.camera);

  return {
    zoom: snap.scale,
    position: snap.position,
    zoomTo: (scale: number) => {
      state.camera.scale = scale;
    },
    moveTo: (position: { x?: number; y?: number }) => {
      updateProxyState(state.camera.position, position);
    },
  };
};

export const useScale = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state.camera);
  return snap.scale;
};

export const useInsertState = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state);

  const setBlockToInsert = (block: BlockToInsert | null) => {
    state.blockToInsert = block;
  };

  const setLastInsertedBlockId = (blockId: string) => {
    state.lastInsertedBlockId = blockId;
  };

  return {
    blockToInsert: snap.blockToInsert,
    lastInsertedBlockId: snap.lastInsertedBlockId,
    setBlockToInsert,
    setLastInsertedBlockId,
  };
};
