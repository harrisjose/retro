import {
  type Block,
  type IdRectangle,
  type Rectangle,
  updateProxyState,
} from "@retro/common";
import { useBlockMapProxy, useSectionMap } from "@retro/sdk";
import { omit } from "lodash-es";
import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import {
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWindowSize } from "usehooks-ts";
import { subscribe, useSnapshot } from "valtio";
import { CanvasContext } from "./provider.js";
import Search from "./search-tree.js";
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
  const shouldReduceMotion = useReducedMotion();
  const sections = useSectionMap();
  const state = useContext(CanvasContext);
  const viewport = useWindowSize();
  const { z: defaultZoom } = computeDefaultCamera(viewport);
  const currentCamera = useSnapshot(state.camera);

  const sectionPosMap = computeSectionCenters(sections, defaultZoom);

  const moveToSection = (sectionId: string | "intro" | "summary") => {
    const target = sectionPosMap[sectionId];
    const current = state.camera;
    if (shouldReduceMotion) {
      updateProxyState(state.camera, { ...currentCamera, ...target });
      return;
    }
    animate(current.x, target.x, {
      duration: 0.5,
      onUpdate(latest) {
        current.x = latest;
      },
    });
    animate(current.y, target.y, {
      duration: 0.5,
      onUpdate(latest) {
        current.y = latest;
      },
    });
    animate(current.z, target.z, {
      duration: 0.5,
      onUpdate(latest) {
        current.z = latest;
      },
    });
  };

  const [activeSection, setActiveSection] = useState("intro");

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
    onDragStart,
    onDrag,
    onDragEnd,
  }: {
    onPinch: (event: WheelEvent) => void;
    onWheel: (event: WheelEvent) => void;
    onClick: (event: MouseEvent) => void;
    onDragStart: (event: MouseEvent) => void;
    onDrag: (event: MouseEvent) => void;
    onDragEnd: (event: MouseEvent) => void;
  },
) => {
  // Ideally this would have been using hooks from useGesture, but it seems to be causing issues
  // with the pinch origin not being correct. UseGesture probably is doing some translation of the
  // event coordinates.
  // TODO @harris: Investigate later since useGesture has debouncing and other nice-ities built in.

  const DRAG_THRESHOLD = 4; // pixels
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hasPassedThreshold, setHasPassedThreshold] = useState(false);

  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.ctrlKey) {
      onPinch(event);
    } else {
      onWheel(event);
    }
  }

  function handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.getAttribute("data-clear-selection")) {
      setStartPoint({ x: event.clientX, y: event.clientY });
      setIsDragging(true);
      setHasPassedThreshold(false);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (isDragging && startPoint) {
      const dx = event.clientX - startPoint.x;
      const dy = event.clientY - startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!hasPassedThreshold && distance >= DRAG_THRESHOLD) {
        setHasPassedThreshold(true);
        onDragStart(event);
      }

      if (hasPassedThreshold) {
        onDrag(event);
      }
    }
  }

  function handleMouseUp(event: MouseEvent) {
    if (isDragging) {
      if (hasPassedThreshold) {
        onDragEnd(event);
      } else {
        onClick(event);
      }
      setIsDragging(false);
      setStartPoint(null);
      setHasPassedThreshold(false);
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
    rootEl.addEventListener("mousedown", handleMouseDown, {
      signal: controller.signal,
    });
    window.addEventListener("mousemove", handleMouseMove, {
      signal: controller.signal,
    });
    window.addEventListener("mouseup", handleMouseUp, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [ref, onPinch, onWheel, isDragging, startPoint, hasPassedThreshold]);
};

export const useScale = () => {
  const state = useContext(CanvasContext);
  const snap = useSnapshot(state.camera);
  return snap.z;
};

export const useCanvasSearch = () => {
  const searchTree = useMemo(() => new Search(), []);

  const blockMap = useBlockMapProxy();

  useEffect(() => {
    const toIdRectangle = (block: Block): IdRectangle => ({
      id: block.id,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
    });

    const onBlockMapChange = (search: Search) => {
      const blockList = Object.values(blockMap).map(toIdRectangle);
      search.clearAll();
      search.addItems(blockList);
    };

    searchTree.init();
    // Call once for initial setup
    onBlockMapChange(searchTree);
    // Subscribe to block changes using valtio's subscribe
    // TODO @harris @pravin: See if this impacts perf negatively, subscribe isn't optimized
    const unsubscribe = subscribe(blockMap, () => onBlockMapChange(searchTree));

    return () => {
      unsubscribe();
    };
  }, []);

  const searchByRectangle = ({
    x,
    y,
    width,
    height,
  }: Rectangle): IdRectangle[] => {
    return searchTree.searchByRectangle({ x, y, width, height });
  };

  return { searchByRectangle };
};
