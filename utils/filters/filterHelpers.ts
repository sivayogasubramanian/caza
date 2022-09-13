import { Prisma, RoleType } from '@prisma/client';
import { canBecomeValidYear } from '../date/validations';
import { getNonEmptyArrayOrUndefined } from '../arrays';

export function makeCompanyNameFilters(searchWords: string[]) {
  // Do not want to return names that contain the year to prevent zero results.
  return searchWords.length === 0
    ? undefined
    : searchWords
        .filter((word) => !canBecomeValidYear(word))
        .map((word) => ({
          name: {
            contains: word,
            mode: Prisma.QueryMode.insensitive,
          },
        }));
}

export function makeRoleTitleFilters(searchWords: string[]) {
  // Do not want to return titles that contain the year.
  // This prevents unrelated titles that only match the year but not the other search words.
  const roleTitleSearchWords = searchWords
    .filter((word) => !canBecomeValidYear(word))
    .map((word) => ({
      title: {
        contains: word,
        mode: Prisma.QueryMode.insensitive,
      },
    }));
  return getNonEmptyArrayOrUndefined(roleTitleSearchWords);
}

export function makeRoleYearFilters(searchWords: string[]) {
  const roleYearSearchWords = searchWords
    .filter(canBecomeValidYear)
    .map(Number)
    .map((yearKeyword) => ({
      year: {
        equals: yearKeyword,
      },
    }));
  return getNonEmptyArrayOrUndefined(roleYearSearchWords);
}

export function makeRoleTypeFilters(roleTypes: RoleType[]) {
  return roleTypes.length === 0
    ? undefined
    : roleTypes.map((roleType) => ({
        type: {
          equals: roleType,
        },
      }));
}
