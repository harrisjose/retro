import { updateProxyState } from "@retro/common";
import { useSectionMap } from "@retro/sdk";
import { omit } from "lodash-es";
import { animate } from "motion";
import {
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWindowSize } from "usehooks-ts";
import { useSnapshot } from "valtio";
import { CanvasContext } from "./provider.js";
import { type Point } from "./types.js";
import {
  computeDefaultCamera,
  computeSectionCenters,
  computeZoomBounds,
  getActiveSectionOnScreen,
  panCamera,
  zoomCamera,
} from "./utils.js";

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
    zoomTo: (z: number) => {
      updateProxyState(state.camera, { ...state.camera, z });
    },
    moveBy: (dx: number = 0, dy: number = 0) => {
      updateProxyState(state.camera, panCamera(state.camera, dx, dy));
    },
    moveTo: (x: number, y: number) => {
      updateProxyState(state.camera, { ...state.camera, x, y });
    },
  };
};

export const useSectionNavigation = () => {
  const sections = useSectionMap();
  const state = useContext(CanvasContext);
  const viewport = useWindowSize();
  const { z: defaultZoom } = computeDefaultCamera(viewport);

  const sectionPosMap = computeSectionCenters(sections, defaultZoom);

  const moveToSection = (sectionId: string | "intro" | "summary") => {
    const target = sectionPosMap[sectionId];
    const current = state.camera;
    animate(current, target, {
      duration: 0.5,
    });
  };

  const [activeSection, setActiveSection] = useState("intro");
  const currentCamera = useSnapshot(state.camera);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const newActiveSection = getActiveSectionOnScreen(
        currentCamera,
        sectionPosMap,
      );
      setActiveSection(newActiveSection!);
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentCamera, sectionPosMap]);

  return {
    activeSection,
    moveToSection,
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
    const controller = new AbortController();

    rootEl.addEventListener("wheel", handleWheel, {
      passive: false,
      signal: controller.signal,
    });
    rootEl.addEventListener("click", handleClick, {
      signal: controller.signal,
    });
    return () => {
      controller.abort();
    };
  }, [ref, onPinch, onWheel]);
};

export const useScale = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state.camera);
  return snap.z;
};
