import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken, JWTpayload } from '@/domain/entities/AuthToken';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ITokenStore } from '@/application/interface/ITokenStore';
import { DIContainer } from '@/infrastructure/di/DIContainer';

export class AuthRepository implements IAuthRepository {
  private readonly JWT_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
  private readonly REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds
  private tokenStore: ITokenStore;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    this.REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret';
    // Get tokenStore from DI
    this.tokenStore = DIContainer.getInstance().resolve('tokenStore');
  }

  async generateToken(payload: JWTpayload): Promise<AuthToken> {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
    const jti = uuidv4();
    const refreshPayload = { ...payload, jti };
    const refreshToken = jwt.sign(refreshPayload, this.REFRESH_SECRET);
    const expiresIn = 15 * 60; // 15 minutes in seconds
    await this.tokenStore.setToken(jti, payload.userId);
    return { accessToken, refreshToken, expiresIn };
  }

  async verifyToken(token: string): Promise<JWTpayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.JWT_SECRET, (err, decoded) => {
        if (err) reject(new Error('Invalid token'));
        else resolve(decoded as JWTpayload);
      });
    });
  }

  async rotateRefreshToken(refreshToken: string): Promise<AuthToken> {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, this.REFRESH_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
    const { jti, userId, userType, email } = decoded;
    if (!jti) throw new Error('Malformed refresh token');
    const exists = await this.tokenStore.hasToken(jti);
    if (!exists) {
      throw new Error('Refresh token already used or invalid (possible replay attack)');
    }
    // Invalidate old refresh token
    await this.tokenStore.deleteToken(jti);
    // Issue new tokens
    const payload: JWTpayload = { userId, userType, email };
    return this.generateToken(payload);
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, this.REFRESH_SECRET);
    } catch (err) {
      return;
    }
    const { jti } = decoded;
    if (jti) {
      await this.tokenStore.deleteToken(jti);
    }
  }

  // Stateless JWT: no DB for access token invalidation
  async invalidateAccessToken(accessToken: string): Promise<void> {
    // No-op
  }
  async isAccessTokenInvalidated(accessToken: string): Promise<boolean> {
    return false;
  }
}