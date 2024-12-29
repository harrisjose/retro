import { CanvasConstants } from "@retro/common";
import type { SectionMap } from "src/sections/types.js";

export const computeInitialZoom = () => {
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

  return zoom;
};

export const computeZoomBounds = (sections: SectionMap) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const sectionWidth = CanvasConstants.SectionWidth;
  const sectionCount = Object.keys(sections).length;
  const totalWPadding =
    CanvasConstants.PaddingAround * 2 +
    CanvasConstants.PaddingBetween * (sectionCount - 1);
  const totalSectionWidth = sectionCount * sectionWidth;

  const min = viewport.width / (totalSectionWidth + totalWPadding);
  const max = 1;

  return { min, max };
};

export const computeInitialPosition = (zoom: number, sections: SectionMap) => {
  // Calculate total width and height of the sections container
  const sectionCount = Object.keys(sections).length;
  const totalWidth =
    CanvasConstants.SectionWidth * sectionCount +
    CanvasConstants.PaddingAround * 2 +
    CanvasConstants.PaddingBetween * (sectionCount - 1);
  const totalHeight =
    CanvasConstants.SectionHeight + CanvasConstants.PaddingAround * 2;

  // When using transform-origin: center center, the scaling creates an offset
  // that we need to compensate for to maintain top-left alignment
  const scaledWidth = totalWidth * zoom;
  const scaledHeight = totalHeight * zoom;

  return {
    x: (totalWidth - scaledWidth) / 2,
    y: (totalHeight - scaledHeight) / 2,
  };
};
