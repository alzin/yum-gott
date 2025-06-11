"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
class AuthMiddleware {
    constructor(authRepository) {
        this.authRepository = authRepository;
        this.authenticate = async (req, res, next) => {
            try {
                console.log('AuthMiddleware: Checking authentication...');
                console.log('Raw cookies:', req.headers.cookie);
                // Parse cookies manually if not already parsed
                if (!req.cookies && req.headers.cookie) {
                    req.cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
                        const [key, value] = cookie.trim().split('=');
                        acc[key] = value;
                        return acc;
                    }, {});
                }
                console.log('Parsed cookies:', req.cookies);
                console.log('Headers:', req.headers);
                let token = req.cookies?.accessToken;
                if (!token) {
                    const authHeader = req.headers.authorization;
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        token = authHeader.substring(7);
                    }
                }
                console.log('Token found:', !!token);
                if (token) {
                    console.log('Token value:', token);
                }
                if (!token) {
                    console.log('AuthMiddleware: No token found');
                    res.status(401).json({
                        success: false,
                        message: 'Access token required'
                    });
                    return;
                }
                const payload = await this.authRepository.verifyToken(token);
                console.log('Token payload:', payload);
                req.user = payload;
                // Additional check for userType consistency in requests with userType field
                if (req.body.userType && req.body.userType !== payload.userType) {
                    res.status(403).json({
                        success: false,
                        message: 'User type mismatch: Provided user type does not match authenticated user'
                    });
                    return;
                }
                next();
            }
            catch (error) {
                console.error('AuthMiddleware: Authentication error:', error);
                const refreshToken = req.cookies?.refreshToken;
                if (refreshToken) {
                    try {
                        console.log('Attempting to refresh token...');
                        const newTokens = await this.authRepository.refreshToken(refreshToken);
                        this.setAuthCookies(res, newTokens);
                        const payload = await this.authRepository.verifyToken(newTokens.accessToken);
                        req.user = payload;
                        // Check userType consistency after refresh
                        if (req.body.userType && req.body.userType !== payload.userType) {
                            res.status(403).json({
                                success: false,
                                message: 'User type mismatch: Provided user type does not match authenticated user'
                            });
                            return;
                        }
                        next();
                        return;
                    }
                    catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        this.clearAuthCookies(res);
                    }
                }
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
        };
    }
    setAuthCookies(res, authToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', authToken.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: authToken.expiresIn * 1000,
            path: '/'
        });
        res.cookie('refreshToken', authToken.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });
    }
    // في AuthMiddleware.ts
    clearAuthCookies(res) {
        console.log('AuthMiddleware: Clearing cookies for request', res.req?.originalUrl);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
    }
}
exports.AuthMiddleware = AuthMiddleware;
