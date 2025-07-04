import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthToken, JWTpayload } from '@/domain/entities/AuthToken';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DatabaseConnection } from '@/infrastructure/database/DataBaseConnection';
import { CONFIG } from '../../main/Config';

export class AuthRepository implements IAuthRepository {
  private readonly JWT_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY: string;
  private readonly REFRESH_TOKEN_EXPIRY: string;
  private readonly db: DatabaseConnection;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || '';
    this.REFRESH_SECRET = process.env.REFRESH_SECRET || '';
    this.ACCESS_TOKEN_EXPIRY = CONFIG.ACCESS_TOKEN_EXPIRATION;
    this.REFRESH_TOKEN_EXPIRY = CONFIG.REFRESH_TOKEN_EXPIRATION;
    this.db = DatabaseConnection.getInstance();
  }

  async generateToken(payload: JWTpayload): Promise<AuthToken> {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY as any,
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY as any,
    });

    const decoded = jwt.decode(refreshToken) as JwtPayload;
    const expiresAt = new Date((decoded?.exp ?? 0) * 1000);

    const insertQuery = `
      INSERT INTO refresh_tokens (token, user_id, user_type, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
    const insertValues = [refreshToken, payload.userId, payload.userType, expiresAt];

    await this.db.query(insertQuery, insertValues);

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<JWTpayload> {
    if (await this.isAccessTokenInvalidated(token)) {
      throw new Error('Access token has been invalidated');
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.JWT_SECRET, (err, decoded) => {
        if (err) return reject(new Error('Invalid token'));
        resolve(decoded as JWTpayload);
      });
    });
  }

  async rotateRefreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(refreshToken, this.REFRESH_SECRET) as JwtPayload;

      const { exp, iat, ...payloadWithoutMeta } = decoded;
      const payload = payloadWithoutMeta as JWTpayload;

      const checkQuery = `
        SELECT 1 FROM refresh_tokens
        WHERE token = $1 AND expires_at > NOW()
      `;
      const checkResult = await this.db.query(checkQuery, [refreshToken]);

      if (!checkResult.rows.length) {
        throw new Error('Refresh token not recognized or expired');
      }

      await this.invalidateRefreshToken(refreshToken);
      return await this.generateToken(payload);
    } catch (err) {
      console.error('JWT verification error:', err);
      throw new Error('Invalid or expired refresh token');
    }
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    const deleteQuery = 'DELETE FROM refresh_tokens WHERE token = $1';
    await this.db.query(deleteQuery, [refreshToken]);
  }

  async invalidateAccessToken(accessToken: string): Promise<void> {
    const decoded = jwt.decode(accessToken) as JwtPayload;
    const expiresAt = new Date((decoded?.exp ?? 0) * 1000);

    const insertQuery = `
      INSERT INTO invalidated_tokens (token, expires_at)
      VALUES ($1, $2)
    `;
    await this.db.query(insertQuery, [accessToken, expiresAt]);
  }

  async isAccessTokenInvalidated(accessToken: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM invalidated_tokens
      WHERE token = $1 AND expires_at > NOW()
    `;
    const result = await this.db.query(query, [accessToken]);
    return result.rows.length > 0;
  }
}
