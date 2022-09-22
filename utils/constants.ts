export const MIN_YEAR = 1970;

// This is the minimum date that can be recorded, measured against 01 January 1970 UTC.
export const MIN_DATE = new Date(-8640000000000000);

export const COMPANY_LOGO_API_URL = 'https://logo.clearbit.com/';
export const DEFAULT_LOGO_SIZE = 40;

/**
 * Default number of months before the start of role.
 * E.g. if set to 6, we assume that the role beings in 6 months' time.
 *
 * Used to prefill the 'Year' field in the role form.
 */
export const DEFAULT_NUM_MONTHS_BEFORE_ROLE_START = 6;

// Routes
export const HOMEPAGE_ROUTE = '/';
export const APPLICATIONS_ROUTE = '/applications';
export const CREATE_APPLICATION_ROUTE = APPLICATIONS_ROUTE + '/create';
export const WORLD_ROUTE = '/world';

export const TAILWIND_MD_BREAKPOINT_PIXELS = 768;

// Service worker message types
export const SW_PRECACHE_USER_DATA_MESSAGE = 'SW_PRECACHE_USER_DATA';

// Default debounce delay of 0.5s
export const DEBOUNCE_DELAY = 500;
