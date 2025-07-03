import { Response } from 'express';
import { CONFIG } from '../../main/Config'
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

export const setAuthCookies = (res: Response, authToken: AuthToken): void => {
  const ONE_MINUTE_IN_MS = 60 * 1000;
  const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
  const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;
  const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;

  res.cookie(CONFIG.ACCESS_TOKEN_COOKIE_NAME, authToken.accessToken, {
    ...getCookieOptions(),
    maxAge: ONE_DAY_IN_MS,
  });

  res.cookie(CONFIG.REFRESH_TOKEN_COOKIE_NAME, authToken.refreshToken, {
    ...getCookieOptions(),
    maxAge: ONE_WEEK_IN_MS,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(CONFIG.ACCESS_TOKEN_COOKIE_NAME, getCookieOptions());
  res.clearCookie(CONFIG.REFRESH_TOKEN_COOKIE_NAME, getCookieOptions());
};
