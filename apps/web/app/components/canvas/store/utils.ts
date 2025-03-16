import type { Rectangle, SectionMap } from "@retro/common";
import { CanvasConstants } from "@retro/common";
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

export const computeDefaultCamera = (viewport?: {
  width: number;
  height: number;
}): Camera => {
  // Get the viewport dimensions
  viewport = viewport ?? {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Get the total height needed for the section
  const totalSectionHeight = CanvasConstants.SectionHeight; // Height of one section
  const totalHPadding = 150; // Padding above and below to position the section at center of the viewport

  // Calculate the scale needed to fit the section vertically in the viewport
  // Formula: viewportHeight / contentHeight
  // This ensures the entire height (including padding) fits in the viewport
  const zoom = viewport.height / (totalSectionHeight + totalHPadding);

  return { x: totalHPadding / 2, y: totalHPadding / 2, z: zoom };
};

export const computeZoomBounds = (sections: SectionMap): Bounds => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const sectionCount = Object.keys(sections).length;
  const totalWPadding = CanvasConstants.PaddingBetween * (sectionCount - 1);

  const totalSectionWidth =
    Object.values(sections).reduce((acc, section) => acc + section.width, 0) +
    2 * CanvasConstants.IntroSectionWidth;

  const totalContainerWidth = totalSectionWidth + totalWPadding;

  const min = viewport.width / totalContainerWidth;
  const max = 1.7;

  return { min, max };
};

export const computeSectionCenters = (
  sections: SectionMap,
  targetZoom?: number,
): Record<string, Camera> => {
  // Get the viewport dimensions
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Helper function to compute individual section position
  const computeSectionPosition = (x: number, width: number): Camera => {
    const centerPoint = {
      x: x + width / 2,
      y: CanvasConstants.SectionHeight / 2,
    };

    const screenCenter = {
      x: viewport.width / 2,
      y: viewport.height / 2,
    };

    const screenCenterInCanvas = screenToCanvas(screenCenter, tempCamera);

    return {
      x: screenCenterInCanvas.x - centerPoint.x,
      y: screenCenterInCanvas.y - centerPoint.y,
      z,
    };
  };

  // Use provided zoom or compute default
  const z = targetZoom ?? computeDefaultCamera().z;
  const tempCamera = { x: 0, y: 0, z };

  // Initialize result map with intro position
  const positions: Record<string, Camera> = {
    intro: computeSectionPosition(0, CanvasConstants.IntroSectionWidth),
  };

  // Track cumulative x position as we go
  let xPosition =
    CanvasConstants.IntroSectionWidth + CanvasConstants.PaddingBetween;

  // Compute positions for all regular sections
  Object.entries(sections).forEach(([sectionId, section]) => {
    positions[sectionId] = computeSectionPosition(xPosition, section.width);
    xPosition += section.width + CanvasConstants.PaddingBetween;
  });

  // Add summary position
  positions.summary = computeSectionPosition(
    xPosition,
    CanvasConstants.IntroSectionWidth,
  );

  return positions;
};

export const getSectionBounds = (
  sectionMap: SectionMap,
): Record<string, Rectangle> => {
  let xPosition =
    CanvasConstants.IntroSectionWidth + CanvasConstants.PaddingBetween;
  const sectionBounds: Record<string, Rectangle> = {};

  // Compute positions for all regular sections
  Object.entries(sectionMap).forEach(([sectionId, section]) => {
    sectionBounds[sectionId] = {
      x: xPosition,
      y: 0,
      width: section.width,
      height: section.height,
    };
    xPosition += section.width + CanvasConstants.PaddingBetween;
  });

  return sectionBounds;
};

export const getActiveSectionOnScreen = (
  camera: Camera,
  sectionPosMap: Record<string, Camera>,
): string => {
  // Find the section with the closest center point
  let closestSection = "intro"; // Default to first section
  let minDistance = Infinity;

  // Calculate current viewport center in canvas coordinates
  const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const currentCenter = screenToCanvas(screenCenter, camera);

  Object.entries(sectionPosMap).forEach(([sectionId, position]) => {
    // Calculate section's center in canvas coordinates
    const sectionCenter = screenToCanvas(screenCenter, position);

    // Calculate distance between centers
    const distance = Math.abs(sectionCenter.x - currentCenter.x);

    if (distance < minDistance) {
      minDistance = distance;
      closestSection = sectionId;
    }
  });

  return closestSection;
};

export const getRectangleFromPoints = (
  pointA: Point,
  pointB: Point,
): Rectangle => {
  const minX = Math.min(pointA.x, pointB.x);
  const minY = Math.min(pointA.y, pointB.y);
  const maxX = Math.max(pointA.x, pointB.x);
  const maxY = Math.max(pointA.y, pointB.y);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};
