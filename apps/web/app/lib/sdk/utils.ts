export const updateProxyState = <T>(entity: T, data: Partial<T>): T => {
  // TODO: Handle arrays
  for (const key in data) {
    if (data[key] !== undefined) {
      if (typeof data[key] === "object") {
        updateProxyState(entity[key], data[key]);
      } else {
        entity[key] = data[key];
      }
    }
  }
  return entity;
};
