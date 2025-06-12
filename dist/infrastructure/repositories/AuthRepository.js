"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthRepository {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key';
        this.jwtExpiration = 24 * 60 * 60; // 24 hours in seconds
        this.refreshTokenExpiration = 7 * 24 * 60 * 60; // 7 days in seconds
    }
    async generateToken(payload, isRefreshToken = false) {
        const tokenPayload = { ...payload };
        const options = {};
        if (!tokenPayload.exp) {
            options.expiresIn = isRefreshToken ? this.refreshTokenExpiration : this.jwtExpiration;
        }
        try {
            const token = jsonwebtoken_1.default.sign(tokenPayload, this.jwtSecret, options);
            console.log('AuthRepository: Token generated', {
                userId: tokenPayload.userId,
                userType: tokenPayload.userType,
                iat: tokenPayload.iat,
                exp: tokenPayload.exp || 'Set by expiresIn'
            });
            return {
                accessToken: token,
                expiresIn: isRefreshToken ? this.refreshTokenExpiration : this.jwtExpiration,
                refreshToken: isRefreshToken ? null : jsonwebtoken_1.default.sign(tokenPayload, this.jwtSecret, { expiresIn: this.refreshTokenExpiration })
            };
        }
        catch (error) {
            console.error('AuthRepository: Token generation failed', error);
            throw error;
        }
    }
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            console.log('AuthRepository: Token verified', {
                userId: decoded.userId,
                userType: decoded.userType,
                exp: decoded.exp,
                expirationDate: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration'
            });
            return decoded;
        }
        catch (error) {
            console.error('AuthRepository: Token verification failed', { error: error instanceof Error ? error.message : error });
            throw new Error('Invalid or expired token');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = await this.verifyToken(refreshToken);
            const { exp, iat, nbf, ...newPayload } = payload;
            const newTokens = await this.generateToken(newPayload, false);
            console.log('AuthRepository: Token refreshed', {
                userId: newPayload.userId,
                userType: newPayload.userType
            });
            return newTokens;
        }
        catch (error) {
            console.error('AuthRepository: Refresh token failed', error);
            throw new Error('Invalid or expired refresh token');
        }
    }
}
exports.AuthRepository = AuthRepository;
