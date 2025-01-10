import { CanvasConstants } from "@retro/common";
import type { SectionMap } from "@retro/sdk";
import type { Bounds, Box, Camera, Point } from "./types";

// Please read https://www.steveruiz.me/posts/zoom-ui for context before changing any of this
export function screenToCanvas(point: Point, camera: Camera): Point {
  return {
    x: point.x / camera.z - camera.x,
    y: point.y / camera.z - camera.y,
  };
}

export function canvasToScreen(point: Point, camera: Camera): Point {
  return {
    x: (point.x + camera.x) * camera.z,
    y: (point.y + camera.y) * camera.z,
  };
}

export function getViewport(camera: Camera, box: Box): Box {
  const topLeft = screenToCanvas({ x: box.minX, y: box.minY }, camera);
  const bottomRight = screenToCanvas({ x: box.maxX, y: box.maxY }, camera);

  return {
    minX: topLeft.x,
    minY: topLeft.y,
    maxX: bottomRight.x,
    maxY: bottomRight.y,
    height: bottomRight.x - topLeft.x,
    width: bottomRight.y - topLeft.y,
  };
}

export function panCamera(camera: Camera, dx: number, dy: number): Camera {
  const x = camera.x - dx / camera.z;
  const y = camera.y - dy / camera.z;

  return {
    x,
    y,
    z: camera.z,
  };
}

export function zoomCamera(
  camera: Camera,
  point: Point,
  dz: number,
  bounds: Bounds,
): Camera {
  const zoom = camera.z - dz * camera.z;

  if (zoom < bounds.min) {
    return { ...camera, z: bounds.min };
  }
  if (zoom > bounds.max) {
    return { ...camera, z: bounds.max };
  }

  const p1 = screenToCanvas(point, camera);

  const p2 = screenToCanvas(point, { ...camera, z: zoom });

  return {
    x: camera.x + (p2.x - p1.x),
    y: camera.y + (p2.y - p1.y),
    z: zoom,
  };
}

export const computeDefaultCamera = (): Camera => {
  // Get the viewport dimensions
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Get the total height needed for the section
  const totalSectionHeight = CanvasConstants.SectionHeight; // Height of one section
  const totalHPadding = CanvasConstants.PaddingAround * 2; // Padding above and below

  // Calculate the scale needed to fit the section vertically in the viewport
  // Formula: viewportHeight / contentHeight
  // This ensures the entire height (including padding) fits in the viewport
  const zoom = viewport.height / (totalSectionHeight + totalHPadding);

  return { x: 0, y: 0, z: zoom };
};

export const computeZoomBounds = (sections: SectionMap): Bounds => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const sectionCount = Object.keys(sections).length;
  const totalWPadding =
    CanvasConstants.PaddingAround * 2 +
    CanvasConstants.PaddingBetween * (sectionCount - 1);

  const totalSectionWidth =
    Object.values(sections).reduce((acc, section) => acc + section.width, 0) +
    2 * CanvasConstants.IntroSectionWidth;

  const totalContainerWidth = totalSectionWidth + totalWPadding;

  const min = viewport.width / totalContainerWidth;
  const max = 1;

  return { min, max };
};
