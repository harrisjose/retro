import { CanvasConstants } from "@retro/common";
import * as random from "lib0/random";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import type { TypedArray } from "yjs-types";

const defaultSections = [
  {
    name: "What went well?",
    index: "0",
    width: CanvasConstants.SectionWidth,
    height: CanvasConstants.SectionHeight,
  },
  {
    name: "What went wrong?",
    index: "1",
    width: CanvasConstants.SectionWidth,
    height: CanvasConstants.SectionHeight,
  },
  {
    name: "What can we do better?",
    index: "2",
    width: CanvasConstants.SectionWidth,
    height: CanvasConstants.SectionHeight,
  },
];

export const getInitialYDoc = () => {
  const yDoc = new Y.Doc();
  const sectionsMap = yDoc.getMap("sections");

  defaultSections.forEach((section) => {
    const id = random.uuidv4();

    sectionsMap.set(id, new Y.Array());

    const backingArray = sectionsMap.get(id) as TypedArray<any>;
    const sectionKV = new YKeyValue(backingArray);

    Object.entries(section).forEach(([key, value]) => {
      sectionKV.set(key, value);
    });
  });

  const blocksMap = yDoc.getMap("blocks");
  const propertiesMap = yDoc.getMap("properties");
  // TODO @harris: Add default blocks and properties

  return Buffer.from(Y.encodeStateAsUpdate(yDoc));
};
