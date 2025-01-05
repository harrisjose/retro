import { without } from "lodash-es";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import type { TypedArray, TypedMap } from "yjs-types";
import { updateProxyState } from "./proxyutils.js";
import { toSerialized, type TypedKV } from "./yutils.js";

export const bindProxyToKVRef = <
  T extends TypedArray<any>,
  R extends TypedKV<any>,
>(
  proxy: any,
  ref: T,
) => {
  const yKV = new YKeyValue(ref) as R;
  const serialized = toSerialized(yKV);
  // Set the initial value
  updateProxyState(proxy, serialized);
  // Create an observer the ref so that we can listen to updates on it
  ref.observeDeep((events) => {
    events.forEach((event) => {
      const currentTarget = event.currentTarget as T;
      // Merge subsequent changes into the proxy
      updateProxyState(proxy, toSerialized(new YKeyValue(currentTarget) as R));
    });
  });
};

export const bindProxyToRef = <T extends Y.AbstractType<any>>(
  proxy: any,
  ref: T,
) => {
  const properties = toSerialized(ref);
  updateProxyState(proxy, properties);

  // Create an observer on each properties so that we can granularly update the state
  ref.observeDeep((events) => {
    events.forEach((event) => {
      const currentTarget = event.currentTarget as T;
      updateProxyState(proxy, toSerialized(currentTarget));
    });
  });
};

export const observeKeysInMapRef = <
  T extends TypedMap<Record<string, unknown>>,
  U extends TypedMap<any> | TypedArray<any>,
>(
  ref: T,
  current: Record<string, any>,
  onAdd: (key: string, value: U) => void,
  onRemove: (key: string) => void,
) => {
  ref.observeDeep((events) => {
    events.forEach((event) => {
      const keys = Array.from((event.currentTarget as T).keys());
      const newKeys = without(keys, ...Object.keys(current));
      const removedKeys = without(Object.keys(current), ...keys);

      removedKeys.forEach((key) => onRemove(key));
      newKeys.forEach((key) =>
        onAdd(key, (event.currentTarget as T).get(key) as U),
      );
    });
  });
};
