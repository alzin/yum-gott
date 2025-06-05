// src/presentation/middleware/AuthMiddleware.ts
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
      let token = req.cookies?.accessToken;
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
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const newTokens = await this.authRepository.refreshToken(refreshToken);
          this.setAuthCookies(res, newTokens);
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
          this.clearAuthCookies(res);
        }
      }
      
      res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  };

  // ... rest of the file remains the same
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