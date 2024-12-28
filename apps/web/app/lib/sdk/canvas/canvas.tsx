import { omit } from "lodash-es";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { proxy, useSnapshot } from "valtio";
import { updateProxyState } from "../utils";
import type { CanvasState } from "./types";
import { computeInitialPosition, computeInitialZoom } from "./utils";

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
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      sections: { a1x: {}, b2y: {}, c3z: {}, d4w: {} },
    })
  ).current;

  useEffect(() => {
    updateProxyState(
      state.camera.position,
      computeInitialPosition(state.camera.scale, state.sections)
    );
  }, []);

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

export const useSections = () => {
  const state = useContext(CanvasContext);
  return useSnapshot(state.sections);
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
