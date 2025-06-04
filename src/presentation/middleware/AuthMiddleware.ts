import { Request, Response, NextFunction } from 'express';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { JWTpayload } from '@/domain/entities/AuthToken';

export interface AuthenticatedRequest extends Request {
  user?: JWTpayload;
}

export class AuthMiddleware {
  constructor(private authRepository: IAuthRepository) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // First, try to get token from cookies (preferred method)
      let token = req.cookies?.accessToken;
      
      // Fallback to Authorization header for backward compatibility
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        res.status(401).json({ 
          success: false,
          message: 'Access token required' 
        });
        return;
      }

      const payload = await this.authRepository.verifyToken(token);
      req.user = payload;
      next();
      
    } catch (error) {
      // Token is invalid or expired, try to refresh if we have a refresh token
      const refreshToken = req.cookies?.refreshToken;
      
      if (refreshToken) {
        try {
          const newTokens = await this.authRepository.refreshToken(refreshToken);
          
          // Set new cookies
          this.setAuthCookies(res, newTokens);
          
          // Verify the new access token and continue
          const payload = await this.authRepository.verifyToken(newTokens.accessToken);
          req.user = payload;
          next();
          return;
          
        } catch (refreshError) {
          // Refresh failed, clear cookies and return unauthorized
          this.clearAuthCookies(res);
        }
      }
      
      res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  };

  // Optional middleware for routes that don't require authentication but can use it
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.accessToken || 
                   (req.headers.authorization?.startsWith('Bearer ') ? 
                    req.headers.authorization.substring(7) : null);

      if (token) {
        const payload = await this.authRepository.verifyToken(token);
        req.user = payload;
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
    
    next();
  };

  private setAuthCookies(res: Response, authToken: any): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', authToken.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: authToken.expiresIn * 1000,
      path: '/'
    });

    res.cookie('refreshToken', authToken.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
  }

  private clearAuthCookies(res: Response): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}