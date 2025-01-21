import { updateProxyState } from "@retro/common";
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useRef,
} from "react";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";
import { type CanvasState } from "./types.js";
import { computeDefaultCamera, getViewport } from "./utils.js";

export const CanvasContext = createContext<CanvasState>({} as any);

export const CanvasProvider = ({
  id,
  children,
}: PropsWithChildren<{ id: string }>) => {
  const state = useRef(
    proxy<CanvasState>({
      id: id,
      camera: computeDefaultCamera(),
      viewport: getViewport(computeDefaultCamera(), {
        minX: 0,
        minY: 0,
        maxX: window.innerWidth,
        maxY: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    }),
  ).current;

  useEffect(() => {
    const handleResize = () => {
      updateProxyState(
        state.viewport,
        getViewport(state.camera, {
          minX: 0,
          minY: 0,
          maxX: window.innerWidth,
          maxY: window.innerHeight,
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      );
    };
    const controller = new AbortController();
    window.addEventListener("resize", handleResize, {
      signal: controller.signal,
    });
    return () => {
      controller.abort();
    };
  });

  // Set-up devtools
  useEffect(() => {
    const unsub = devtools(state, { name: "canvas", enabled: true });
    return () => unsub?.();
  }, []);

  return (
    <CanvasContext.Provider value={state}>{children}</CanvasContext.Provider>
  );
};
