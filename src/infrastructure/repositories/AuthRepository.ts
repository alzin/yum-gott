import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken, JWTpayload } from '@/domain/entities/AuthToken';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';

export class AuthRepository implements IAuthRepository {
  private readonly JWT_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private db: DatabaseConnection;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    this.REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret';
    this.db = DatabaseConnection.getInstance();
  }

  async generateToken(payload: JWTpayload): Promise<AuthToken> {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
    const refreshToken = uuidv4();
    const expiresIn = 15 * 60; // 15 minutes in seconds

    await this.db.query(
      'INSERT INTO refresh_tokens (token, user_id, user_type, expires_at) VALUES ($1, $2, $3, $4)',
      [refreshToken, payload.userId, payload.userType, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    return { accessToken, refreshToken, expiresIn };
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
    const result = await this.db.query(
      'SELECT user_id, user_type FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (!result.rows.length) {
      throw new Error('Invalid or expired refresh token');
    }

    const { user_id, user_type , email} = result.rows[0];

    const payload: JWTpayload = {
      userId: user_id,
      userType: user_type,
      email: email, 
    };

    const newTokens = await this.generateToken(payload);

    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

    return newTokens;
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  async invalidateAccessToken(accessToken: string): Promise<void> {
    await this.db.query(
      'INSERT INTO invalidated_tokens (token, expires_at) VALUES ($1, $2)',
      [accessToken, new Date(Date.now() + 15 * 60 * 1000)] // Match access token expiry
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