import { isObjectLike } from "lodash-es";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import type { TypedArray, TypedMap } from "yjs-types";

class Raw<YType> {
  private _value: YType;
  constructor(value: YType) {
    this._value = value;
  }
  value(): YType {
    return this._value;
  }
}

export type RawValue<YType extends Y.AbstractType<any>> = typeof Raw<YType>;

/**
 * Wraps a value to prevent it from being deserialized by fromSerialized
 * @param value The value to wrap
 * @returns A Raw instance containing the value
 */
export function raw<YType>(value: YType): Raw<YType> {
  return new Raw(value);
}

type StringKeyOf<T> = Extract<keyof T, string>;

export interface TypedKV<Data extends Record<string, unknown>>
  extends YKeyValue<any> {
  delete<Key extends StringKeyOf<Data>>(key: Key): void;

  set<Key extends StringKeyOf<Data>>(key: Key, value: Data[Key]): Data[Key];

  get<Key extends StringKeyOf<Data>>(key: Key): Data[Key] | undefined;

  has<Key extends StringKeyOf<Data>>(key: Key): boolean;

  [Symbol.iterator]<Key extends StringKeyOf<Data>>(): IterableIterator<
    [Key, Data[Key]]
  >;
}

/** More about inferring nested types without being redundant
 * https://stackoverflow.com/a/63631544
 */
export type InferSerialized<YType> = YType extends
  | TypedMap<infer T>
  | TypedKV<infer T>
  ? {
      [Key in keyof T]: T[Key] extends TypedMap<any> | TypedKV<any>
        ? InferSerialized<T[Key]>
        : T[Key] extends TypedArray<infer W>
          ? W[]
          : T[Key];
    }
  : YType extends TypedArray<infer V>
    ? YType extends Y.XmlFragment
      ? string
      : YType extends Y.XmlText
        ? string
        : V[]
    : YType;

function fromSerializedMap<YType extends TypedMap<any>>(
  value: InferSerialized<YType>,
): YType {
  const map = new Y.Map() as YType;
  if (value == null) return map;
  Object.keys(value).forEach((key) => {
    map.set(key, fromSerialized(value[key]));
  });
  return map;
}

function fromSerializedArray<YType extends Y.Array<any>>(
  value: InferSerialized<YType>,
): YType {
  const array = new Y.Array() as YType;
  const first = value[0];

  if (Array.isArray(first)) {
    // @ts-expect-error type mismatch due to ts limitation in inferring nested types
    value.forEach((item: YType) => array.push(fromSerializedArray(item)));
  } else if (isObjectLike(first)) {
    value.forEach((item) => array.push([fromSerializedMap(item)]));
  } else if (value instanceof Raw) {
    array.push(value.value());
  } else {
    array.push(value);
  }
  return array;
}

/**
 * Deserializes a plain object to a Yjs value.
 * When including Yjs types within the value, remember to wrap them with a raw() call.
 *
 * Note: Does not support YKeyValue yet.
 *
 * Example: In most scenarios, we will need to include a Y.XmlFragment within the value. It does not make
 * sense to use the serialized format for this so you would do something like:
 *
 * ```ts
 * const yMap = fromSerialized({
 *   data: { ...values ... },
 *   contentFragment: raw(new Y.XmlFragment()),
 * });
 * ```
 *
 * @param value - The plain object to deserialize. Ideally you would be passing a js object here.
 * @returns The Yjs shared type.
 */
export function fromSerialized<YType>(value: InferSerialized<YType>): YType {
  if (value == null) return null as YType;
  else if (value instanceof Raw) {
    return value.value() as YType;
  } else if (value instanceof Y.AbstractType) {
    return value as YType;
  } else if (Array.isArray(value)) {
    // @ts-expect-error type mismatch due to ts limitation in inferring nested types
    return fromSerializedArray<YType>(value);
  } else if (isObjectLike(value)) {
    // @ts-expect-error type mismatch due to ts limitation in inferring nested types
    return fromSerializedMap<YType>(value as Record<string, any>);
  } else {
    return value as YType;
  }
}

/**
 * Serializes a Yjs value to a plain objects. YArray and YMap are serialized to arrays and objects respectively.
 * YXmlFragment and YXmlText are serialized to strings. Any other values are returned as is.
 *
 * @param value - The Yjs value to serialize.
 * @returns The serialized value.
 */
export function toSerialized<T>(value: T): InferSerialized<T> {
  if (
    value instanceof Y.XmlFragment ||
    value instanceof Y.XmlText ||
    value instanceof Y.Map ||
    value instanceof Y.Array
  ) {
    return value.toJSON() as InferSerialized<T>;
  } else if (value instanceof YKeyValue) {
    return Object.fromEntries(
      value.yarray.toArray().map(({ key, val }) => [key, val]),
    ) as InferSerialized<T>;
  } else {
    // For non-Yjs types, simply return the value
    return value as InferSerialized<T>;
  }
}

export function toCloned<T>(value: T): T {
  if (value == null) return null as T;
  if (value instanceof Y.AbstractType) {
    return value.clone() as T;
  } else if (Array.isArray(value)) {
    return value.map((item) => toCloned(item)) as T;
  } else if (isObjectLike(value)) {
    // @ts-expect-error type mismatch due to ts limitation in inferring nested types
    return Object.keys(value).reduce(
      (acc, key) => {
        // @ts-ignore
        acc[key] = toCloned(value[key]);
        return acc;
      },
      {} as Record<string, any>,
    );
  } else {
    return value as T;
  }
}
