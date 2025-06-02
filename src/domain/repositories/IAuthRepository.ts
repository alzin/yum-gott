import { AuthToken, JWTpayload } from "../entities/AuthToken";

export interface IAuthRepository {
    generateToken(payload: JWTpayload): Promise<AuthToken>
    verifyToken(token: string): Promise<JWTpayload>
    refreshToken(refreshToken: string): Promise<AuthToken>
}