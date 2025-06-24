import { AuthToken, JWTpayload } from "../entities/AuthToken";

export interface IAuthRepository {
    generateToken(payload: JWTpayload): Promise<AuthToken>;
    verifyToken(token: string): Promise<JWTpayload>;
    rotateRefreshToken(refreshToken: string): Promise<AuthToken>;
    invalidateRefreshToken(refreshToken: string): Promise<void>;
    invalidateAccessToken(accessToken: string): Promise<void>;
    isAccessTokenInvalidated(accessToken: string): Promise<boolean>;
}