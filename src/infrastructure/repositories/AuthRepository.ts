import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken, JWTpayload } from '@/domain/entities/AuthToken';
import jwt from 'jsonwebtoken';
import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import { CONFIG } from '../../main/Config';

export class AuthRepository implements IAuthRepository {
  private readonly JWT_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY: string = CONFIG.ACCESS_TOKEN_EXPIRATION;
  private readonly REFRESH_TOKEN_EXPIRY: string = CONFIG.REFRESH_TOKEN_EXPIRATION;
  private db: DatabaseConnection;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET!;
    this.REFRESH_SECRET = process.env.REFRESH_SECRET!;
    this.db = DatabaseConnection.getInstance();
  }

  async generateToken(payload: JWTpayload): Promise<AuthToken> {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY as any,
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY as any,
    });

    const decoded: any = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await this.db.query(
      'INSERT INTO refresh_tokens (token, user_id, user_type, expires_at) VALUES ($1, $2, $3, $4)',
      [refreshToken, payload.userId, payload.userType, expiresAt]
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<JWTpayload> {
    if (await this.isAccessTokenInvalidated(token)) {
      throw new Error('Access token has been invalidated');
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.JWT_SECRET, (err, decoded) => {
        if (err) reject(new Error('Invalid token'));
        else resolve(decoded as JWTpayload);
      });
    });
  }

  async rotateRefreshToken(refreshToken: string): Promise<AuthToken> {
  
    try {
      const decoded = jwt.verify(refreshToken, this.REFRESH_SECRET) as JWTpayload;
      const { exp, iat, ...cleanPayload } = decoded as any;
      const newTokens = await this.generateToken(cleanPayload);

      const result = await this.db.query(
        'SELECT 1 FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
        [refreshToken]
      );

      if (!result.rows.length) {
        throw new Error('Refresh token not recognized or expired');
      }

      await this.invalidateRefreshToken(refreshToken);

      return newTokens;
    } catch (err) {
      console.error('JWT verification error:', err);

      throw new Error('Invalid or expired refresh token');
    }
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  async invalidateAccessToken(accessToken: string): Promise<void> {
    const decoded: any = jwt.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await this.db.query(
      'INSERT INTO invalidated_tokens (token, expires_at) VALUES ($1, $2)',
      [accessToken, expiresAt]
    );
  }

  async isAccessTokenInvalidated(accessToken: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT 1 FROM invalidated_tokens WHERE token = $1 AND expires_at > NOW()',
      [accessToken]
    );
    return result.rows.length > 0;
  }
}
