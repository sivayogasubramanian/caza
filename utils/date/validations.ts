export function isValidDate(value: string) {
  return !isNaN(Date.parse(value));
}
