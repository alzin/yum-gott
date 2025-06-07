import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
export class AuthRepository {
  private readonly jwtSecret: string;
  private readonly jwtExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key';
    this.jwtExpiration = 24 * 60 * 60; // 24 hours in seconds
    this.refreshTokenExpiration = 7 * 24 * 60 * 60; // 7 days in seconds
  }

  async generateToken(payload: JwtPayload, isRefreshToken = false): Promise<any> {
    const tokenPayload = { ...payload };
    // إذا لم يكن هناك exp في الـ payload، أضف expiresIn
    const options: jwt.SignOptions = {};
    if (!tokenPayload.exp) {
      options.expiresIn = isRefreshToken ? this.refreshTokenExpiration : this.jwtExpiration;
    }
    try {
      const token = jwt.sign(tokenPayload, this.jwtSecret, options);
      console.log('AuthRepository: Token generated', {
        userId: tokenPayload.userId,
        iat: tokenPayload.iat,
        exp: tokenPayload.exp || 'Set by expiresIn'
      });
      return {
        accessToken: token,
        expiresIn: isRefreshToken ? this.refreshTokenExpiration : this.jwtExpiration,
        refreshToken: isRefreshToken ? null : jwt.sign(tokenPayload, this.jwtSecret, { expiresIn: this.refreshTokenExpiration })
      };
    } catch (error) {
      console.error('AuthRepository: Token generation failed', error);
      throw error;
    }
  }

 async verifyToken(token: string): Promise<JwtPayload> {
  try {
    const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
    console.log('AuthRepository: Token verified', {
      userId: decoded.userId,
      userType: decoded.userType,
      exp: decoded.exp,
      expirationDate: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration'
    });
    return decoded;
  } catch (error) {
    console.error('AuthRepository: Token verification failed', { error: error instanceof Error ? error.message : error });
    throw new Error('Invalid or expired token');
  }
}

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = await this.verifyToken(refreshToken);
      // إزالة exp القديم من الـ payload
      const { exp, iat, nbf, ...newPayload } = payload;
      const newTokens = await this.generateToken(newPayload, false);
      console.log('AuthRepository: Token refreshed', {
        userId: newPayload.userId,
        userType: newPayload.userType
      });
      return newTokens;
    } catch (error) {
      console.error('AuthRepository: Refresh token failed', error);
      throw new Error('Invalid or expired refresh token');
    }
  }
}