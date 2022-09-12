import { Prisma, RoleType } from '@prisma/client';
import { canBecomeValidYear, isValidYear } from '../date/validations';
import { canBecomeInteger } from '../numbers/validations';

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
  // Filtering for year is done separately.
  const roleTitleSearchWords = searchWords
    .filter((word) => !canBecomeValidYear(word))
    .map((word) => ({
      title: {
        contains: word,
        mode: Prisma.QueryMode.insensitive,
      },
    }));
  return roleTitleSearchWords.length === 0 ? undefined : roleTitleSearchWords;
}

export function makeRoleYearFilters(searchWords: string[]) {
  const roleYearSearchWords = searchWords
    .filter(canBecomeInteger)
    .map(Number)
    .filter(isValidYear)
    .map((yearKeyword) => ({
      year: {
        equals: yearKeyword,
      },
    }));
  return roleYearSearchWords.length === 0 ? undefined : roleYearSearchWords;
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
