"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = void 0;
const setAuthCookies = (res, authToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', authToken.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'none',
        maxAge: authToken.expiresIn * 1000,
        path: '/'
    });
    res.cookie('refreshToken', authToken.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'none',
        path: '/'
    };
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
};
exports.clearAuthCookies = clearAuthCookies;
