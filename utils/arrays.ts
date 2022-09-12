export function combineDefinedArrays<T>(items: (T[] | undefined)[]) {
  return items.reduce<T[]>((combinedArray, item) => (item ? [...combinedArray, ...item] : combinedArray), []);
}

export function getArrayOrUndefined<T>(items: T[]) {
  return items.length === 0 ? undefined : items;
}
