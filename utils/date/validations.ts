import { MIN_ROLE_YEAR } from '../constants';
import { canBecomeInteger } from '../numbers/validations';

export function isValidDate(value: string) {
  return !isNaN(Date.parse(value));
}

export function isValidYear(value: number) {
  return value >= MIN_ROLE_YEAR;
}

export function canBecomeValidYear(value: unknown) {
  return canBecomeInteger(value) && isValidYear(Number(value));
}
