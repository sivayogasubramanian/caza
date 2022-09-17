import { RoleType } from '@prisma/client';
import Immutable from 'immutable';

export const roleTypeToDisplayStringMap = Immutable.Map<RoleType, string>({
  WINTER_INTERNSHIP: 'Winter Internship',
  SPRING_INTERNSHIP: 'Spring Internship',
  SUMMER_INTERNSHIP: 'Summer Internship',
  FALL_INTERNSHIP: 'Fall Internship',
  FULL_TIME: 'Full Time',
});
