const LOCAL_STORAGE_PREVIOUS_USER_KEY = 'pre-redirect-user-key';

export function storePreviousUserToken(oldToken: string) {
  localStorage.setItem(LOCAL_STORAGE_PREVIOUS_USER_KEY, oldToken);
}

export function getPreviousUserToken() {
  return localStorage.getItem(LOCAL_STORAGE_PREVIOUS_USER_KEY);
}

export function removePreviousUserToken() {
  localStorage.removeItem(LOCAL_STORAGE_PREVIOUS_USER_KEY);
}
