export enum RoleType {
  WINTER_INTERNSHIP = 'WINTER_INTERNSHIP',
  SPRING_INTERNSHIP = 'SPRING_INTERNSHIP',
  SUMMER_INTERNSHIP = 'SUMMER_INTERNSHIP',
  FALL_INTERNSHIP = 'FALL_INTERNSHIP',
  FULL_TIME = 'FULL_TIME',
}

export type RolePostData = {
  companyId: number;
  title: string;
  type: RoleType;
  year: number;
};
