export interface ITokenStore {
    setToken(jti: string, userId: string, expiresInSeconds?: number): Promise<void>;
    hasToken(jti: string): Promise<boolean>;
    deleteToken(jti: string): Promise<void>;
} 