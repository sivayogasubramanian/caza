// Compares only dates by making time the same.
export function compareDateOnly(firstDate: Date, secondDate: Date) {
  return firstDate.setHours(0, 0, 0, 0) - secondDate.setHours(0, 0, 0, 0);
}
