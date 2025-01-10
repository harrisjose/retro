import { updateProxyState } from "@retro/common";
import {
  type PropsWithChildren,
  createContext,
  useLayoutEffect,
  useRef,
} from "react";
import { proxy } from "valtio";
import { CanvasMode, type CanvasState } from "./types.js";
import { computeDefaultCamera, getViewport } from "./utils.js";

export const CanvasContext = createContext<CanvasState>({} as any);

export const CanvasProvider = ({
  id,
  children,
}: PropsWithChildren<{ id: string }>) => {
  const state = useRef(
    proxy<CanvasState>({
      id: id,
      mode: CanvasMode.None,
      camera: computeDefaultCamera(),
      viewport: getViewport(computeDefaultCamera(), {
        minX: 0,
        minY: 0,
        maxX: window.innerWidth,
        maxY: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      selection: [],
      insertion: {
        selectedBlock: null,
        lastInsertedId: null,
      },
    }),
  ).current;

  useLayoutEffect(() => {
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
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <CanvasContext.Provider value={state}>{children}</CanvasContext.Provider>
  );
};
