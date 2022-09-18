export function combineDefinedArrays<T>(items: (T[] | undefined)[]) {
  return items.reduce<T[]>((combinedArray, item) => (item ? [...combinedArray, ...item] : combinedArray), []);
}

export function getNonEmptyArrayOrUndefined<T>(items: T[]) {
  return items.length === 0 ? undefined : items;
}

/**
 * Builds frequency map of items. Note that Javascript Map is only guaranteed to compare keys by its value if it is a
 * primitive type or a wrapper for a primitive type. For non-primitive types used as keys, Map will use object value
 * comparison ( { foo: true } !== { foo: true } )
 */
export function buildFrequencyMap<T>(items: T[]): Map<T, number> {
  return items.reduce((counts, item) => {
    const currCount = counts.get(item) ?? 0;
    counts.set(item, currCount + 1);
    return counts;
  }, new Map<T, number>());
}
