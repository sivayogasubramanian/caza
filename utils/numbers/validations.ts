export function canBecomeInteger(value: unknown) {
  const number = Number(value);
  return !isNaN(number) && Number.isInteger(number);
}
