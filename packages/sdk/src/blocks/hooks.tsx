import type {
  Block,
  Properties,
  YBlockBase,
  YBlockMap,
  YProperties,
  YPropertiesMap,
} from "@retro/common";
import { fromSerialized } from "@retro/common";
import * as random from "lib0/random";
import { useContext } from "react";
import { useSnapshot } from "valtio";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import { DocContext, useYDoc } from "../document/document.js";

const insertBlock =
  (yBlockMap: YBlockMap, yPropertiesMap: YPropertiesMap) =>
  (input: Exclude<Block, "id">, properties: Properties) => {
    const blockId = input.id ?? random.uuidv4();
    yBlockMap.set(blockId, new Y.Array() as YBlockBase);

    const yBlockBase = yBlockMap.get(blockId) as YBlockBase;
    const yBlock = new YKeyValue(yBlockBase);

    yBlock.set("id", blockId);
    yBlock.set("type", input.type);
    yBlock.set("x", input.x);
    yBlock.set("y", input.y);
    yBlock.set("width", input.width);
    yBlock.set("height", input.height);

    const yProperties = fromSerialized<YProperties>(properties);
    yPropertiesMap.set(blockId, yProperties);
  };

export const useCreateBlock = () => {
  const yDoc = useYDoc();
  const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
  const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;

  const createBlock = (input: Exclude<Block, "id">, properties: Properties) => {
    yDoc.transact(() => {
      insertBlock(yBlockMap, yPropertiesMap)(input, properties);
    });
  };

  return createBlock;
};

export const useBlockMap = () => {
  const { blocks } = useContext(DocContext);
  const snapshot = useSnapshot(blocks);
  return snapshot as Record<string, Block>;
};

export const useBlock = (blockId: string) => {
  const { blocks } = useContext(DocContext);
  const snapshot = useSnapshot(blocks);
  const yDoc = useYDoc();

  const setPosition = (x: number, y: number) => {
    const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
    const yBlockBase = yBlockMap.get(blockId) as YBlockBase;
    const yBlock = new YKeyValue(yBlockBase);
    yDoc.transact(() => {
      yBlock.set("x", x);
      yBlock.set("y", y);
    });
  };

  return { block: snapshot[blockId] as Block, setPosition };
};

export const useMultiBlockActions = () => {
  const yDoc = useYDoc();

  const deleteBlocks = (blockIds: string[]) => {
    console.debug("Deleting blocks", blockIds);

    const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
    const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
    yDoc.transact(() => {
      blockIds.forEach((blockId) => {
        yBlockMap.delete(blockId);
        yPropertiesMap.delete(blockId);
      });
    });
  };

  const moveBlocks = (blockIds: string[], dx: number, dy: number) => {
    console.debug("Moving blocks", blockIds, dx, dy);
    console.log("Not implemented");
  };

  return { deleteBlocks, moveBlocks };
};

export const useBlockProperties = <T extends Properties>(
  blockId: string,
): {
  properties: T;
  setProperty: (propertyName: keyof T, value: T[keyof T]) => void;
} => {
  const yDoc = useYDoc();
  const { properties } = useContext(DocContext);
  const snapshot = useSnapshot(properties);

  const setProperty = (propertyName: keyof T, value: T[keyof T]) => {
    const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
    const yProperties = yPropertiesMap.get(blockId) as YProperties;
    yDoc.transact(() => {
      // @ts-ignore
      yProperties.set(propertyName, value);
    });
  };

  return { properties: snapshot[blockId] as T, setProperty };
};

export const useRawBlockProperty = <T extends any>(
  blockId: string,
  propertyName: string,
) => {
  const yDoc = useYDoc();
  const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
  const yProperties = yPropertiesMap.get(blockId) as T;

  if (!yProperties) return null;

  return ((yProperties as any).get(propertyName) as T) ?? null;
};
