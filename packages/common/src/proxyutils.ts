import { isNil } from "lodash-es";

export const updateProxyState = <T>(entity: T, data: Partial<T>): T => {
  // TODO: Handle arrays
  for (const key in data) {
    if (data[key] !== undefined) {
      if (typeof data[key] === "object") {
        if (isNil(entity[key])) entity[key] = {} as T[Extract<keyof T, string>];
        updateProxyState(entity[key], data[key]);
      } else {
        entity[key] = data[key];
      }
    }
  }
  return entity;
};
