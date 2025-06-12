// src/presentation/middleware/AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { JWTpayload } from '@/domain/entities/AuthToken';
import { clearAuthCookies, setAuthCookies } from '@/shared/utils/cookieUtils';

export interface AuthenticatedRequest extends Request {
  user?: JWTpayload;
}

export class AuthMiddleware {
  constructor(private authRepository: IAuthRepository) { }

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('AuthMiddleware: Checking authentication...');
      console.log('Raw cookies:', req.headers.cookie);

      // Parse cookies manually if not already parsed
      if (!req.cookies && req.headers.cookie) {
        req.cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
      }

      console.log('Parsed cookies:', req.cookies);
      console.log('Headers:', req.headers);

      let token = req.cookies?.accessToken;
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      console.log('Token found:', !!token);
      if (token) {
        console.log('Token value:', token);
      }

      if (!token) {
        console.log('AuthMiddleware: No token found');
        res.status(401).json({
          success: false,
          message: 'Access token required'
        });
        return;
      }

      const payload = await this.authRepository.verifyToken(token);
      console.log('Token payload:', payload);
      req.user = payload;

      // Additional check for userType consistency in requests with userType field
      if (req.body.userType && req.body.userType !== payload.userType) {
        res.status(403).json({
          success: false,
          message: 'User type mismatch: Provided user type does not match authenticated user'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('AuthMiddleware: Authentication error:', error);
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...');
          const newTokens = await this.authRepository.refreshToken(refreshToken);
          setAuthCookies(res, newTokens);
          const payload = await this.authRepository.verifyToken(newTokens.accessToken);
          req.user = payload;

          // Check userType consistency after refresh
          if (req.body.userType && req.body.userType !== payload.userType) {
            res.status(403).json({
              success: false,
              message: 'User type mismatch: Provided user type does not match authenticated user'
            });
            return;
          }

          next();
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.clearAuthCookies(res);
        }
      }

      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  };

  // Note: setAuthCookies is now imported from cookieUtils
  
  private clearAuthCookies(res: Response): void {
    console.log('AuthMiddleware: Clearing cookies for request', res.req?.originalUrl);
    clearAuthCookies(res);
  }
}