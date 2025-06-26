import { Response } from 'express';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const setAuthCookies = (res: Response, authToken: AuthToken): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', authToken.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: authToken.expiresIn * 1000,
    path: '/'
  });

  res.cookie('refreshToken', authToken.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days 
    path: '/'
  });
};

export const clearAuthCookies = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    path: string;
  } = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/'
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
