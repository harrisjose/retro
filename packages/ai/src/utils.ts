import {
  BlockType,
  CanvasConstants,
  type YBlock,
  type YBlockBase,
  type YBlockMap,
  type YCardProperties,
  type YPropertiesMap,
  type YSection,
  type YSectionBase,
  type YSectionMap,
} from "@retro/common";
import {
  EditorSchema,
  HtmlUtils,
  yXmlFragmentToProseMirrorRootNode,
} from "@retro/pm";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import type { TypedMap } from "yjs-types";
import type { Bounds, SerializedDocument } from "./types.js";

function isBlockInSectionBounds(
  sectionBounds: Bounds,
  blockBounds: Bounds,
): boolean {
  // Calculate block dimensions
  const blockWidth = blockBounds.right - blockBounds.left;
  const blockHeight = blockBounds.bottom - blockBounds.top;

  // Calculate overlap dimensions
  const overlapLeft = Math.max(blockBounds.left, sectionBounds.left);
  const overlapRight = Math.min(blockBounds.right, sectionBounds.right);
  const overlapTop = Math.max(blockBounds.top, sectionBounds.top);
  const overlapBottom = Math.min(blockBounds.bottom, sectionBounds.bottom);

  // Calculate overlap area
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);
  const overlapArea = overlapWidth * overlapHeight;

  // Calculate block area and required overlap percentage
  const blockArea = blockWidth * blockHeight;
  const requiredOverlap = 0.6; // 60%

  return overlapArea / blockArea >= requiredOverlap;
}

function getBlocksInSectionBounds(
  yDoc: Y.Doc,
  sectionBounds: Bounds,
): Record<string, YBlockBase> {
  const blocks = yDoc.getMap("blocks") as YBlockMap;
  const blocksInSection = Array.from(blocks.entries())
    .filter(([id, block]) => {
      const blockKV = new YKeyValue(block as YBlockBase) as YBlock;
      return blockKV.get("type") === BlockType.Card;
    })
    .filter(([id, block]) => {
      const blockBounds = getBlockBounds(block as YBlockBase);
      return isBlockInSectionBounds(sectionBounds, blockBounds);
    });

  return Object.fromEntries(blocksInSection);
}

function getSectionBounds(sections: YSectionMap, sectionId: string): Bounds {
  const sectionKV = new YKeyValue(
    sections.get(sectionId) as YSectionBase,
  ) as YSection;
  const sectionStart = Array.from(sections.entries()).reduce(
    (acc, [id, section]) => {
      const sKV = new YKeyValue(section as YSectionBase) as YSection;
      if (Number(sKV.get("index")) < Number(sectionKV.get("index"))) {
        return (
          acc + Number(sKV.get("width")) + CanvasConstants.PaddingBetween / 2
        );
      }
      return acc;
    },

    CanvasConstants.IntroSectionWidth + CanvasConstants.PaddingBetween / 2,
  );
  const sectionEnd =
    sectionStart +
    Number(sectionKV.get("width")) +
    CanvasConstants.PaddingBetween / 2;

  return {
    left: sectionStart,
    right: sectionEnd,
    top: 0,
    bottom: sectionKV.get("height")!,
  };
}

function getIntroSectionBounds(): Bounds {
  return {
    left: 0,
    right:
      CanvasConstants.IntroSectionWidth + CanvasConstants.PaddingBetween / 2,
    top: 0,
    bottom: CanvasConstants.SectionHeight,
  };
}

function getBlockBounds(block: YBlockBase): Bounds {
  const blockKV = new YKeyValue(block as YBlockBase) as YBlock;
  return {
    left: blockKV.get("x")!,
    right: blockKV.get("x")! + blockKV.get("width")!,
    top: blockKV.get("y")!,
    bottom: blockKV.get("y")! + blockKV.get("height")!,
  };
}

function serializeBlock(
  yDoc: Y.Doc,
  id: string,
): {
  type: string;
  content: string;
} {
  const properties = yDoc.getMap("properties") as YPropertiesMap;
  const blockProps = properties.get(id) as YCardProperties;
  const content = blockProps.get("content") as Y.XmlFragment;
  const html = HtmlUtils.generateHtmlFromDoc(
    yXmlFragmentToProseMirrorRootNode(content, EditorSchema.CardSchema),
    EditorSchema.CardSchema,
  );
  return {
    type: BlockType.Card,
    content: html,
  };
}

const serializeSection = (id: string, yDoc: Y.Doc) => {
  const sections = yDoc.getMap("sections") as YSectionMap;
  const section = sections.get(id) as YSectionBase;
  const sectionKV = new YKeyValue(section as YSectionBase) as YSection;
  const sectionBounds = getSectionBounds(sections, id);

  const blocksInSection = getBlocksInSectionBounds(yDoc, sectionBounds);
  const serializedBlocks = Object.entries(blocksInSection).map(([id]) => {
    return serializeBlock(yDoc, id);
  });

  return {
    name: sectionKV.get("name")!,
    content: null,
    blocks: serializedBlocks,
  };
};

const serializeIntroSection = (yDoc: Y.Doc) => {
  const intro = yDoc.getMap("intro") as TypedMap<{ content: Y.XmlFragment }>;
  const content = intro.get("content") as Y.XmlFragment;
  const html = HtmlUtils.generateHtmlFromDoc(
    yXmlFragmentToProseMirrorRootNode(content, EditorSchema.IntroSchema),
    EditorSchema.IntroSchema,
  );

  const sectionBounds = getIntroSectionBounds();
  const blocksInSection = getBlocksInSectionBounds(yDoc, sectionBounds);
  const serializedBlocks = Object.entries(blocksInSection).map(([id]) => {
    return serializeBlock(yDoc, id);
  });

  return {
    name: "Introduction",
    content: html,
    blocks: serializedBlocks,
  };
};

export const serializeDocForLlm = (yDoc: Y.Doc): SerializedDocument => {
  const sectionsMap = yDoc.getMap("sections");

  const intro = serializeIntroSection(yDoc);
  const sections = Array.from(sectionsMap.keys()).map((id) =>
    serializeSection(id, yDoc),
  );

  return {
    sections: [intro, ...sections],
  };
};
