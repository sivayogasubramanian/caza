export function combineDefinedArrays<T>(items: (T[] | undefined)[]) {
  return items.reduce<T[]>((combinedArray, item) => (item ? [...combinedArray, ...item] : combinedArray), []);
}

export function getNonEmptyArrayOrUndefined<T>(items: T[]) {
  return items.length === 0 ? undefined : items;
}

export function buildFrequencyMap<T>(items: T[]) {
  return items.reduce((counts, item) => {
    const currCount = counts.get(item) ?? 0;
    counts.set(item, currCount + 1);
    return counts;
  }, new Map<T, number>());
}
