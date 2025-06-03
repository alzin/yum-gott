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
    async generateToken(payload) {
        const accessTokenOptions = {
            expiresIn: this.jwtExpiration,
        };
        const refreshTokenOptions = {
            expiresIn: this.refreshTokenExpiration,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.jwtSecret, accessTokenOptions);
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.jwtSecret, refreshTokenOptions);
        return {
            accessToken,
            refreshToken,
            expiresIn: this.jwtExpiration,
        };
    }
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    async refreshToken(refreshToken) {
        const payload = await this.verifyToken(refreshToken);
        return this.generateToken(payload);
    }
}
exports.AuthRepository = AuthRepository;
