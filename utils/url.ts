/**
 * Converts an object into a URI query string.
 * Supports arrays and nested objects.
 */
// eslint-disable-next-line
export function toQueryString(object: Record<string, any>, prefix = ''): string {
  if (object === undefined || object === null) {
    return '';
  }

  const query = Object.keys(object).map((key) => {
    const value = object[key];

    if (object.constructor === Array) {
      key = prefix;
    } else if (object.constructor === Object) {
      key = prefix ? `${prefix}[${key}]` : key;
    }

    if (typeof value === 'object') {
      return toQueryString(value, key);
    } else if (value === undefined || value === null) {
      return '';
    } else {
      return `${key}=${encodeURIComponent(value)}`;
    }
  });

  return query.filter((str) => str.length > 0).join('&');
}
