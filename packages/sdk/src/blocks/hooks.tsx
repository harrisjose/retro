import { fromSerialized } from "@retro/common";
import * as random from "lib0/random";
import { useContext } from "react";
import { DocContext, useYDoc } from "src/document/document.js";
import type {
  Block,
  Properties,
  YBlockBase,
  YBlockMap,
  YProperties,
  YPropertiesMap,
} from "src/sections/types.js";
import { useSnapshot } from "valtio";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";

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
  return snapshot[blockId] as Block;
};

export const useBlockProperties = (blockId: string) => {
  const { properties } = useContext(DocContext);
  const snapshot = useSnapshot(properties);
  return snapshot[blockId];
};

export const useRawBlockProperty = <T extends any>(
  blockId: string,
  propertyName: string
) => {
  const yDoc = useYDoc();
  const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
  const yProperties = yPropertiesMap.get(blockId) as T;

  if (!yProperties) return null;

  return ((yProperties as any).get(propertyName) as T) ?? null;
};
