import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthToken, JWTpayload } from '@/domain/entities/AuthToken';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

export class AuthRepository implements IAuthRepository {
  private readonly jwtSecret: string;
  private readonly jwtExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key';
    this.jwtExpiration = 24 * 60 * 60; // 24 hours in seconds
    this.refreshTokenExpiration = 7 * 24 * 60 * 60; // 7 days in seconds
  }

  async generateToken(payload: JWTpayload): Promise<AuthToken> {
    const accessTokenOptions: SignOptions = {
      expiresIn: this.jwtExpiration,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: this.refreshTokenExpiration,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, accessTokenOptions);
    const refreshToken = jwt.sign(payload, this.jwtSecret, refreshTokenOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiration,
    };
  }

  async verifyToken(token: string): Promise<JWTpayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTpayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const payload = await this.verifyToken(refreshToken);
    return this.generateToken(payload);
  }
}