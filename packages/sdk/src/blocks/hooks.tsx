import type {
  Block,
  Properties,
  YBlockBase,
  YBlockMap,
  YProperties,
  YPropertiesMap,
} from "@retro/common";
import { fromSerialized } from "@retro/common";
import { authClient } from "lib/auth-client.js";
import * as random from "lib0/random";
import { isEqual, isNil, isUndefined } from "lodash-es";
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
      if (!isEqual(yBlock.get("x"), x)) yBlock.set("x", x);
      if (!isEqual(yBlock.get("y"), y)) yBlock.set("y", y);
    });
  };

  const setSize = ({
    width,
    height,
  }: {
    width?: number;
    height?: number;
  }) => {
    const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
    const yBlockBase = yBlockMap.get(blockId) as YBlockBase;
    const yBlock = new YKeyValue(yBlockBase);
    yDoc.transact(() => {
      if (!isUndefined(width) && !isEqual(yBlock.get("width"), width))
        yBlock.set("width", width);
      if (!isUndefined(height) && !isEqual(yBlock.get("height"), height))
        yBlock.set("height", height);
    });
  };

  return { block: snapshot[blockId] as Block, setPosition, setSize };
};

export const useMultiBlockActions = () => {
  const yDoc = useYDoc();
  const { blocks } = useContext(DocContext);
  const snapshot = useSnapshot(blocks);

  const getBlocks = (blockId: string[]) => {
    return blockId.map((id) => snapshot[id]);
  };

  const deleteBlocks = (blockIds: string[]) => {
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

  return { deleteBlocks, moveBlocks, getBlocks };
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

export const useBlockAwareness = (blockId: string) => {
  const { data } = authClient.useSession();
  const state = useContext(DocContext);
  const snapshot = useSnapshot(state.presence);
  const { selections, collaborators } = snapshot;

  const selectedByBlockId = selections.filter((s) =>
    s.selected.includes(blockId),
  );

  const collaboratorsByBlockId = selectedByBlockId
    .map((s) => s.id)
    .filter((id) => id !== data?.user.id)
    .map((id) => collaborators.find((c) => c.id === id))
    .filter((c) => !isNil(c));

  return {
    collaborators: collaboratorsByBlockId,
  };
};
