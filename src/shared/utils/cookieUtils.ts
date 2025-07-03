import { Response } from 'express';
import ms from 'ms';
import { CONFIG } from '../../main/Config';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}
const AccessTokenMaxAge = ms(CONFIG.ACCESS_TOKEN_EXPIRATION as any);
const RefreshTokenMaxAge = ms(CONFIG.REFRESH_TOKEN_EXPIRATION as any);

if (typeof AccessTokenMaxAge !== 'number' || typeof RefreshTokenMaxAge !== 'number') {
  throw new Error('Invalid token expiration configuration');
}
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

export const setAuthCookies = (res: Response, authToken: AuthToken): void => {
  res.cookie(CONFIG.ACCESS_TOKEN_COOKIE_NAME, authToken.accessToken, {
    ...getCookieOptions(),
    maxAge: AccessTokenMaxAge,
  });

  res.cookie(CONFIG.REFRESH_TOKEN_COOKIE_NAME, authToken.refreshToken, {
    ...getCookieOptions(),
    maxAge: RefreshTokenMaxAge,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(CONFIG.ACCESS_TOKEN_COOKIE_NAME, getCookieOptions());
  res.clearCookie(CONFIG.REFRESH_TOKEN_COOKIE_NAME, getCookieOptions());
};
