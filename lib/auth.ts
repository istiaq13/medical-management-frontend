export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

