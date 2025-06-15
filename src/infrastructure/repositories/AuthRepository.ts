import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

interface JwtPayloadWithUser extends JwtPayload {
  userId: string;
  userType: string;
}
export class AuthRepository {
  private readonly jwtSecret: string;
  private readonly jwtExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key';
    this.jwtExpiration = 24 * 60 * 60; 
    this.refreshTokenExpiration = 7 * 24 * 60 * 60; 
  }

  async generateToken(payload: JwtPayloadWithUser, isRefreshToken = false): Promise<{ accessToken: string; expiresIn: number; refreshToken: string | null }> {
    const tokenPayload = { 
      ...payload,
      iat: Math.floor(Date.now() / 1000)  // Set the issued at time in the payload
    };
    const options: jwt.SignOptions = {};
    if (!tokenPayload.exp) {
      options.expiresIn = isRefreshToken ? this.refreshTokenExpiration : this.jwtExpiration;
    }
    try {
      const token = jwt.sign(tokenPayload, this.jwtSecret, options);
      console.log('AuthRepository: Token generated', {
        userId: tokenPayload.userId,
        userType: tokenPayload.userType, 
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

 async verifyToken(token: string): Promise<JwtPayloadWithUser> {
  try {
    const decoded = jwt.verify(token, this.jwtSecret) as JwtPayloadWithUser;
    console.log('AuthRepository: Token verified', {
      userId: decoded.userId,
      userType: decoded.userType,
      iat: decoded.iat,
      exp: decoded.exp,
      expirationDate: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration'
    });
    return decoded;
  } catch (error) {
    console.error('AuthRepository: Token verification failed', { error: error instanceof Error ? error.message : error });
    throw new Error('Invalid or expired token');
  }
}

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
    try {
      const payload = await this.verifyToken(refreshToken);
      const { exp, iat, nbf, ...newPayload } = payload;
      
      // Generate new access token
      const accessToken = jwt.sign(newPayload, this.jwtSecret, { expiresIn: this.jwtExpiration });
      
      // Generate new refresh token
      const newRefreshToken = jwt.sign(newPayload, this.jwtSecret, { expiresIn: this.refreshTokenExpiration });
      
      console.log('AuthRepository: Token refreshed', {
        userId: newPayload.userId,
        userType: newPayload.userType
      });
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.jwtExpiration
      };
    } catch (error) {
      console.error('AuthRepository: Refresh token failed', error);
      throw new Error('Invalid or expired refresh token');
    }
  }
}